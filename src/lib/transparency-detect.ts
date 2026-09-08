/**
 * Client-side transparency detection using corner/edge pixel sampling.
 * Checks ~100 pixels from corners and edges to determine if a PNG has transparency.
 * Fast (<100ms) and good enough accuracy for metadata generation.
 */

export function detectTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // EPS files are always transparent (vector format)
    if (file.name.toLowerCase().endsWith('.eps') || file.name.toLowerCase().endsWith('.ai')) {
      resolve(true);
      return;
    }

    // Only PNG supports transparency
    if (!file.name.toLowerCase().endsWith('.png')) {
      resolve(false);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const w = img.width;
      const h = img.height;
      const samplePoints = getSamplePoints(w, h);
      let transparentCount = 0;

      for (const [x, y] of samplePoints) {
        const px = Math.min(Math.floor(x), w - 1);
        const py = Math.min(Math.floor(y), h - 1);
        const pixel = ctx.getImageData(px, py, 1, 1).data;
        // Alpha channel < 250 = transparent (not fully opaque)
        if (pixel[3] < 250) {
          transparentCount++;
        }
      }

      URL.revokeObjectURL(url);
      // If more than 10% of sampled pixels are transparent → it's a transparent PNG
      resolve(transparentCount > samplePoints.length * 0.1);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}

function getSamplePoints(width: number, height: number): [number, number][] {
  const points: [number, number][] = [];
  const margin = 5; // pixels from edge

  // 4 corners (3x3 grid each = 9 points per corner = 36 total)
  const cornerOffsets = [0, 3, 6];
  for (const dx of cornerOffsets) {
    for (const dy of cornerOffsets) {
      points.push([margin + dx, margin + dy]); // top-left
      points.push([width - margin - dx, margin + dy]); // top-right
      points.push([margin + dx, height - margin - dy]); // bottom-left
      points.push([width - margin - dx, height - margin - dy]); // bottom-right
    }
  }

  // Edge midpoints (4 sides × 5 points = 20)
  for (let i = 0; i < 5; i++) {
    const t = 0.2 + (i * 0.15); // 20%, 35%, 50%, 65%, 80%
    points.push([width * t, margin]); // top edge
    points.push([width * t, height - margin]); // bottom edge
    points.push([margin, height * t]); // left edge
    points.push([width - margin, height * t]); // right edge
  }

  // Center area (3x3 grid = 9 points)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      points.push([width / 2 + dx * 20, height / 2 + dy * 20]);
    }
  }

  // Total: 36 + 20 + 9 = 65 sample points
  return points;
}
