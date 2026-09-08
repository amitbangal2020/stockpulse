/**
 * Thumbnail extraction utilities for EPS and video files.
 * Ported from MetaGenerator_V1 (E:\EXP Soft\MetaGenerator_V1)
 */

// ─── EPS/AI Embedded Preview Extraction ───

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, '');
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

function parseEpsiPixels(width: number, height: number, depth: number, bytes: Uint8Array): Uint8ClampedArray | null {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) return null;
  if (width * height > 8192 * 8192) return null;
  if (depth !== 1 && depth !== 8 && depth !== 24) return null;

  const rawRowBytes = depth === 1 ? Math.ceil(width / 8) : depth === 8 ? width : width * 3;
  const paddedRowBytes = rawRowBytes % 2 === 0 ? rawRowBytes : rawRowBytes + 1;
  let rowBytes: number | null = null;
  if (rawRowBytes * height === bytes.length) rowBytes = rawRowBytes;
  else if (paddedRowBytes * height === bytes.length) rowBytes = paddedRowBytes;
  else if (bytes.length >= rawRowBytes * height) rowBytes = rawRowBytes;
  else if (bytes.length >= paddedRowBytes * height) rowBytes = paddedRowBytes;
  if (!rowBytes) return null;

  const pixels = new Uint8ClampedArray(width * height * 4);
  if (depth === 24) {
    for (let y = 0; y < height; y++) {
      const rowStart = y * rowBytes;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const j = rowStart + x * 3;
        pixels[i] = bytes[j];
        pixels[i + 1] = bytes[j + 1];
        pixels[i + 2] = bytes[j + 2];
        pixels[i + 3] = 255;
      }
    }
  } else if (depth === 8) {
    for (let y = 0; y < height; y++) {
      const rowStart = y * rowBytes;
      for (let x = 0; x < width; x++) {
        const v = bytes[rowStart + x];
        const i = (y * width + x) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
    }
  } else {
    for (let y = 0; y < height; y++) {
      const rowStart = y * rowBytes;
      for (let x = 0; x < width; x++) {
        const bit = (bytes[rowStart + (x >> 3)] >> (7 - (x & 7))) & 1;
        const v = bit ? 0 : 255;
        const i = (y * width + x) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
    }
  }
  return pixels;
}

function findTiffOffset(arr: Uint8Array): number {
  for (let i = 0; i < arr.length - 3; i++) {
    if (
      (arr[i] === 0x49 && arr[i + 1] === 0x49 && arr[i + 2] === 0x2a && arr[i + 3] === 0x00) ||
      (arr[i] === 0x4d && arr[i + 1] === 0x4d && arr[i + 2] === 0x00 && arr[i + 3] === 0x2a)
    ) {
      return i;
    }
  }
  return -1;
}

function parseTiffPixels(arr: Uint8Array, offset: number): { width: number; height: number; pixels: Uint8ClampedArray; hasTransparency: boolean } | null {
  const isLE = arr[offset] === 0x49;
  const readU16 = (o: number) => (isLE ? arr[o] | (arr[o + 1] << 8) : (arr[o] << 8) | arr[o + 1]);
  const readU32 = (o: number) =>
    isLE
      ? (arr[o] | (arr[o + 1] << 8) | (arr[o + 2] << 16) | (arr[o + 3] << 24)) >>> 0
      : (((arr[o] << 24) | (arr[o + 1] << 16) | (arr[o + 2] << 8) | arr[o + 3])) >>> 0;

  if (offset + 8 > arr.length || readU16(offset + 2) !== 42) return null;

  const readValue = (e: number) => {
    const type = readU16(e + 2);
    const count = readU32(e + 4);
    const sizeOf = type === 1 || type === 2 ? 1 : type === 3 ? 2 : 4;
    const readAt = (o: number) => (type === 3 ? readU16(o) : readU32(o));
    if (sizeOf * count <= 4) {
      const vals = [];
      for (let i = 0; i < count; i++) vals.push(readAt(e + 8 + i * sizeOf));
      return count === 1 ? vals[0] : vals;
    }
    const base = offset + readU32(e + 8);
    const vals = [];
    for (let i = 0; i < count; i++) vals.push(readAt(base + i * sizeOf));
    return count === 1 ? vals[0] : vals;
  };

  const ifd = offset + readU32(offset + 4);
  if (ifd + 2 > arr.length) return null;
  const count = readU16(ifd);
  if (ifd + 2 + count * 12 > arr.length) return null;

  const tags: Record<number, any> = {};
  for (let i = 0; i < count; i++) {
    const e = ifd + 2 + i * 12;
    tags[readU16(e)] = readValue(e);
  }

  const width = tags[256];
  const height = tags[257];
  if (!width || !height || width > 8192 || height > 8192) return null;
  if ((tags[259] || 1) !== 1) return null;

  const photometric = tags[262];
  const samples = tags[277] || 1;
  let bps = tags[258] || 8;
  if (Array.isArray(bps)) bps = bps[0];

  const stripOffsets = Array.isArray(tags[273]) ? tags[273] : [tags[273]];
  const stripByteCounts = Array.isArray(tags[279]) ? tags[279] : [tags[279]];
  if (!stripOffsets.length || stripByteCounts.length !== stripOffsets.length) return null;

  let total = 0;
  for (const c of stripByteCounts) total += c;
  if (total <= 0 || total > arr.length) return null;

  const raw = new Uint8Array(total);
  let pos = 0;
  for (let s = 0; s < stripOffsets.length; s++) {
    const off = stripOffsets[s];
    const len = stripByteCounts[s] || 0;
    if (offset + off + len > arr.length) return null;
    raw.set(arr.subarray(offset + off, offset + off + len), pos);
    pos += len;
  }

  const pixels = new Uint8ClampedArray(width * height * 4);
  let hasTransparency = false;

  if (photometric === 2 && samples === 3 && bps === 8) {
    const rowBytes = width * 3;
    if (raw.length < rowBytes * height) return null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const j = y * rowBytes + x * 3;
        pixels[i] = raw[j];
        pixels[i + 1] = raw[j + 1];
        pixels[i + 2] = raw[j + 2];
        pixels[i + 3] = 255;
      }
    }
  } else if (photometric === 1 && samples === 1 && bps === 8) {
    const rowBytes = width;
    if (raw.length < rowBytes * height) return null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const v = raw[y * rowBytes + x];
        const i = (y * width + x) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
    }
  } else if (photometric === 3 && samples === 2 && bps === 8) {
    const rowBytes = width * 2;
    const colorMap = Array.isArray(tags[320]) && tags[320].length >= 768 ? tags[320] : null;
    if (!colorMap || raw.length < rowBytes * height) return null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const j = y * rowBytes + x * 2;
        const idx = raw[j];
        const Y = raw[j + 1];
        pixels[i] = Math.min(255, Math.round((Y * colorMap[idx]) / 65280));
        pixels[i + 1] = Math.min(255, Math.round((Y * colorMap[256 + idx]) / 65280));
        pixels[i + 2] = Math.min(255, Math.round((Y * colorMap[512 + idx]) / 65280));
        pixels[i + 3] = Y;
        if (Y < 255) hasTransparency = true;
      }
    }
  } else if ((photometric === 0 || photometric === 1) && samples === 1 && bps === 1) {
    const rowBytes = Math.ceil(width / 8);
    if (raw.length < rowBytes * height) return null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const bit = (raw[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
        const v = photometric === 0 ? (bit ? 0 : 255) : bit ? 255 : 0;
        const i = (y * width + x) * 4;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
        pixels[i + 3] = 255;
      }
    }
  } else {
    return null;
  }

  return { width, height, pixels, hasTransparency };
}

function pixelsToPreviewFile(pixels: Uint8ClampedArray, width: number, height: number, baseName: string): Promise<{ previewUrl: string; companionFile: File } | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }
      const imgData = ctx.createImageData(width, height);
      imgData.data.set(pixels);
      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        const companionFile = new File([blob], `${baseName}.png`, { type: 'image/png' });
        resolve({ previewUrl: URL.createObjectURL(blob), companionFile });
      }, 'image/png');
    } catch {
      resolve(null);
    }
  });
}

/**
 * Extract a usable visual preview from EPS/AI files.
 * Priority: embedded JPEG → EPSI ASCII-hex → TIFF preview
 */
export async function extractEmbeddedPreview(file: File): Promise<{ previewUrl: string; companionFile: File } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arr = new Uint8Array(e.target!.result as ArrayBuffer);
      const baseName = (file.name || 'preview').replace(/\.[^/.]+$/, '');

      // Fast path: embedded JPEG (SOI FF D8 FF ... EOI FF D9)
      let startIdx = -1;
      for (let i = 0; i < arr.length - 2; i++) {
        if (arr[i] === 0xFF && arr[i + 1] === 0xD8 && arr[i + 2] === 0xFF) {
          startIdx = i;
          break;
        }
      }

      if (startIdx !== -1) {
        let endIdx = -1;
        for (let i = arr.length - 2; i > startIdx; i--) {
          if (arr[i] === 0xFF && arr[i + 1] === 0xD9) {
            endIdx = i + 2;
            break;
          }
        }
        if (endIdx !== -1) {
          const jpegSlice = arr.subarray(startIdx, endIdx);
          const blob = new Blob([jpegSlice], { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          const companionFile = new File([blob], baseName + ".jpg", { type: 'image/jpeg' });
          resolve({ previewUrl, companionFile });
          return;
        }
      }

      // EPSI ASCII-hex preview (%%BeginPreview)
      try {
        const text = new TextDecoder('latin1').decode(arr);
        const beginMatch = text.match(/%%BeginPreview:\s*(\d+)\s+(\d+)\s+(\d+)/);
        const endMatch = text.match(/%%EndPreview/);
        if (beginMatch && endMatch) {
          const width = parseInt(beginMatch[1], 10);
          const height = parseInt(beginMatch[2], 10);
          const depth = parseInt(beginMatch[3], 10);
          const headerEndIdx = text.indexOf('\n', beginMatch.index! + beginMatch[0].length);
          const bodyStart = headerEndIdx === -1 ? text.length : headerEndIdx + 1;
          const hexBody = text.substring(bodyStart, endMatch.index!).replace(/\s+/g, '');
          const pixels = parseEpsiPixels(width, height, depth, hexToBytes(hexBody));
          if (pixels) {
            const result = await pixelsToPreviewFile(pixels, width, height, baseName);
            if (result) { resolve(result); return; }
          }
        }
      } catch { /* ignore */ }

      // TIFF preview
      try {
        const tiffOffset = findTiffOffset(arr);
        if (tiffOffset !== -1) {
          const parsed = parseTiffPixels(arr, tiffOffset);
          if (parsed) {
            const result = await pixelsToPreviewFile(parsed.pixels, parsed.width, parsed.height, baseName);
            if (result) { resolve(result); return; }
          }
        }
      } catch { /* ignore */ }

      resolve(null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract a representative frame from a video file as JPEG thumbnail.
 */
export async function extractVideoFrame(file: File): Promise<{ previewUrl: string; companionFile: File } | null> {
  return new Promise((resolve) => {
    let url: string | null = null;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-1';
    document.body.appendChild(video);

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (url) URL.revokeObjectURL(url);
      video.removeAttribute('src');
      try { video.load(); } catch { /* noop */ }
      if (video.parentNode) video.parentNode.removeChild(video);
    };

    const captureAt = (t: number): Promise<Blob | null> => {
      return new Promise((res) => {
        let done = false;
        const finishCapture = (blob: Blob | null) => {
          if (done) return;
          done = true;
          res(blob);
        };
        const draw = () => {
          try {
            const vw = video.videoWidth || 0;
            const vh = video.videoHeight || 0;
            if (!vw || !vh) { finishCapture(null); return; }
            const MAX_DIM = 640;
            let cw = vw, ch = vh;
            if (Math.max(vw, vh) > MAX_DIM) {
              const s = MAX_DIM / Math.max(vw, vh);
              cw = Math.round(vw * s);
              ch = Math.round(vh * s);
            }
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            canvas.getContext('2d')!.drawImage(video, 0, 0, cw, ch);
            canvas.toBlob((blob) => finishCapture(blob), 'image/jpeg', 0.8);
          } catch {
            finishCapture(null);
          }
        };
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          setTimeout(draw, 60);
        };
        video.addEventListener('seeked', onSeeked, { once: true });
        try { video.currentTime = t; } catch { draw(); }
        setTimeout(() => { if (!done) draw(); }, 3000);
      });
    };

    // Check if a frame is mostly blank (black/white)
    const isBlankFrame = async (blob: Blob): Promise<boolean> => {
      return new Promise((res) => {
        const imgUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = 32;
          c.height = 24;
          const ctx = c.getContext('2d')!;
          ctx.drawImage(img, 0, 0, 32, 24);
          const d = ctx.getImageData(0, 0, 32, 24).data;
          let sum = 0;
          for (let i = 0; i < d.length; i += 4) {
            sum += d[i] + d[i + 1] + d[i + 2];
          }
          URL.revokeObjectURL(imgUrl);
          const avg = sum / (32 * 24 * 3);
          // Blank if average brightness < 5 (near black) or > 250 (near white)
          res(avg < 5 || avg > 250);
        };
        img.onerror = () => { URL.revokeObjectURL(imgUrl); res(true); };
        img.src = imgUrl;
      });
    };

    const run = async () => {
      let duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      if (!(duration > 0)) {
        await new Promise((r) => setTimeout(r, 500));
        duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      }
      if (!(duration > 0) && video.seekable && video.seekable.length > 0) {
        const end = video.seekable.end(video.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) duration = end;
      }

      // Try multiple timestamps across the timeline to find the best (non-blank) frame
      let count = 5;
      if (duration > 0) {
        if (duration < 5) count = 3;
        else if (duration < 20) count = 5;
        else count = 7;
      }

      const times: number[] = [];
      if (duration > 0) {
        for (let i = 0; i < count; i++) times.push((duration * (i + 0.5)) / count);
      } else {
        times.push(0.3, 1, 2, 4, 8, 15, 30);
      }

      let bestBlob: Blob | null = null;
      for (const t of times) {
        const blob = await captureAt(t);
        if (!blob) continue;
        const blank = await isBlankFrame(blob);
        if (!blank) {
          bestBlob = blob;
          break; // Found a good frame, stop searching
        }
      }

      finish();

      if (bestBlob) {
        const baseName = (file.name || 'video').replace(/\.[^/.]+$/, '');
        const companionFile = new File([bestBlob], baseName + '.jpg', { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(bestBlob);
        resolve({ previewUrl, companionFile });
      } else {
        resolve(null);
      }
    };

    video.addEventListener('loadedmetadata', run, { once: true });
    video.addEventListener('error', () => { finish(); resolve(null); });
    url = URL.createObjectURL(file);
    video.src = url;
    video.load();

    // Safety timeout
    setTimeout(() => { finish(); resolve(null); }, 15000);
  });
}

/**
 * Rasterize an SVG file to a PNG image in the browser.
 */
export async function rasterizeSvgFile(file: File): Promise<{ previewUrl: string; companionFile: File } | null> {
  return new Promise((resolve) => {
    let blobUrl: string | null = null;
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth || 1024;
      let h = img.naturalHeight || 1024;
      const MAX_DIM = 1024;
      if (Math.max(w, h) > MAX_DIM) {
        const scale = MAX_DIM / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        if (!blob) { resolve(null); return; }
        const baseName = (file.name || 'vector').replace(/\.[^/.]+$/, '');
        const companionFile = new File([blob], baseName + '.png', { type: 'image/png' });
        resolve({ previewUrl: URL.createObjectURL(blob), companionFile });
      }, 'image/png');
    };
    img.onerror = () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve(null);
    };
    blobUrl = URL.createObjectURL(file);
    img.src = blobUrl;
  });
}
