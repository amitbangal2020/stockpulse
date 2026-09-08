// src/renderHost.js
// ---------------------------------------------------------------------------
// Robust SVG -> frame pipeline for the local SVG-to-video converter.
//
// WHY THIS EXISTS
// The previous pipeline serialized the preview's live SVG DOM (or regex-rewrote
// the raw text) and reloaded it as an <img> for every frame. That broke in
// several important ways:
//
//   1. An SVG loaded through <img> runs in browser "static mode": external
//      images, stylesheets and fonts are never fetched. Any SVG referencing a
//      separate PNG, CSS file or web font silently lost those resources.
//   2. SMIL animations restarted at t=0 inside every <img>, so all exported
//      frames showed roughly the same early-animation state regardless of the
//      requested frame time.
//   3. Only a handful of computed properties (opacity, transform,
//      stroke-dashoffset/array, transform-origin) were copied onto the clone,
//      so CSS animations of fill/stroke/r/cx/cy/d/filter/... were lost.
//   4. Batch exports rendered the *preview* SVG's DOM instead of the queued
//      file's content.
//   5. There was no way to detect a blank render before encoding a black MP4.
//
// THE NEW APPROACH ("freeze and bake")
//   * A dedicated hidden iframe renders the SVG as a real live document
//     (scripts, CSS keyframes, SMIL and web fonts all behave normally).
//   * External resources (images, fonts, stylesheets) are inlined as data:
//     URIs up front so every serialized frame is fully self-contained.
//   * For each frame the SMIL clock is seeked (svg.setCurrentTime) and CSS
//     animations are frozen at the exact timestamp using a negative
//     animation-delay plus paused play state.
//   * The frozen live DOM is cloned; every animated/SMIL-target element gets
//     its complete computed style baked as inline styles, SMIL nodes are
//     removed, and all CSS animation/transition is neutralized. The resulting
//     static SVG is rasterized with the browser's real rendering engine (via
//     <img>), which now shows exactly the frozen frame because nothing can
//     re-animate or reload.
//
// This keeps the browser as the actual SVG renderer (no manual canvas
// re-implementation) while making frame capture deterministic and accurate.
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const MAX_INLINE_BYTES = 60 * 1024 * 1024;

export function parseTime(timeStr) {
  if (!timeStr || timeStr === 'indefinite') return 0;
  const clean = String(timeStr).trim().toLowerCase();
  if (clean.endsWith('ms')) return parseFloat(clean) / 1000;
  if (clean.endsWith('min')) return parseFloat(clean) * 60;
  if (clean.endsWith('s')) return parseFloat(clean);
  return parseFloat(clean) || 0;
}

function isHttpUrl(u) { return /^https?:\/\//i.test(u); }
function isDataUrl(u) { return /^data:/i.test(u); }
function isFragment(u) { return String(u).startsWith('#'); }
function isRelativeUrl(u) {
  return !isHttpUrl(u) && !isDataUrl(u) && !isFragment(u) && !/^(blob|about):/i.test(u);
}

export function blobToDataUri(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Could not read resource.'));
    reader.readAsDataURL(blob);
  });
}

function dataUriToText(uri) {
  const idx = uri.indexOf(',');
  if (idx < 0) return '';
  const meta = uri.slice(0, idx);
  const data = uri.slice(idx + 1);
  if (/;base64/i.test(meta)) {
    const bin = atob(data);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  try { return decodeURIComponent(data); } catch { return data; }
}

// ---------------------------------------------------------------------------
// Preprocessing: normalize the document, inline resolvable resources, collect
// actionable warnings about anything that cannot be resolved.
// ---------------------------------------------------------------------------
export async function preprocessSvg(source, { fetchBytes, warn } = {}) {
  const warnings = [];
  const report = (message) => {
    warnings.push(message);
    if (typeof warn === 'function') warn(message);
  };
  const fetched = new Map(); // url -> data URI (dedupes repeated refs)

  const fetchInline = async (url, what) => {
    if (fetched.has(url)) return fetched.get(url);
    if (!fetchBytes) {
      report(`External ${what} "${url}" cannot be inlined in this environment.`);
      fetched.set(url, null);
      return null;
    }
    try {
      const blob = await fetchBytes(url);
      if (!blob || blob.size === 0) throw new Error('empty response');
      if (blob.size > MAX_INLINE_BYTES) {
        report(`${what} "${url}" is too large to inline (> 60 MB) and may be missing.`);
        fetched.set(url, null);
        return null;
      }
      const uri = await blobToDataUri(blob);
      fetched.set(url, uri);
      return uri;
    } catch (err) {
      report(`${what} "${url}" could not be loaded (${err.message}); it will be missing in the exported video.`);
      fetched.set(url, null);
      return null;
    }
  };

  const fetchText = async (url, what) => {
    const uri = await fetchInline(url, what);
    if (!uri) return null;
    try { return dataUriToText(uri); } catch { return null; }
  };

  // ----- parse the document -------------------------------------------------
  let raw = String(source || '').trim();
  if (!raw) throw new Error('No SVG content to export.');
  if (!/<svg\b/i.test(raw)) throw new Error('Input does not contain an <svg> element.');

  const isHtmlWrapper = /<(html|body)\b/i.test(raw);
  let svgElement;

  if (isHtmlWrapper) {
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    svgElement = doc.querySelector('svg');
    if (!svgElement) throw new Error('The HTML document does not contain an <svg> element.');
    // Inline <style> blocks and <link rel="stylesheet"> from the wrapper into
    // the SVG so CSS (including @keyframes) survives serialization.
    const styleClones = Array.from(doc.querySelectorAll('style'));
    for (const st of styleClones) {
      const styleEl = doc.createElementNS(SVG_NS, 'style');
      styleEl.textContent = st.textContent || '';
      svgElement.appendChild(styleEl);
    }
    const linkEls = Array.from(doc.querySelectorAll('link[rel~="stylesheet"]'));
    for (const link of linkEls) {
      const href = (link.getAttribute('href') || '').trim();
      if (!href) continue;
      if (isHttpUrl(href)) {
        const css = await fetchText(href, 'stylesheet');
        if (css != null) {
          const styleEl = doc.createElementNS(SVG_NS, 'style');
          styleEl.textContent = css;
          svgElement.appendChild(styleEl);
        }
      } else if (isRelativeUrl(href)) {
        report(`Relative stylesheet "${href}" could not be resolved from a local file.`);
      }
    }
    // Preserve a body/html background color by injecting a background rect.
    let bodyBgColor = null;
    for (const st of styleClones) {
      const css = st.textContent || '';
      const bg = css.match(/(?:html|body)\s*\{[^}]*background(?:-color)?\s*:\s*([^;}'"\s]+)/i);
      if (bg) bodyBgColor = bg[1].trim();
    }
    if (bodyBgColor && !svgElement.querySelector('#vectra-body-bg')) {
      const rect = doc.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('id', 'vectra-body-bg');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', bodyBgColor);
      svgElement.insertBefore(rect, svgElement.firstChild);
    }
  } else {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) throw new Error('Invalid SVG XML: ' + (parseError.textContent || '').trim().slice(0, 300));
    svgElement = doc.documentElement;
    if (!svgElement || svgElement.nodeName.toLowerCase() !== 'svg') {
      throw new Error('Input is not a valid SVG document.');
    }
  }

  if (!svgElement.getAttribute('xmlns')) svgElement.setAttribute('xmlns', SVG_NS);
  if (!svgElement.getAttribute('xmlns:xlink')) svgElement.setAttribute('xmlns:xlink', XLINK_NS);

  // ----- inline CSS: @import chains and url() references --------------------
  const inlineCss = async (css, depth = 0) => {
    if (depth > 4) return css;
    let out = css;
    const importRe = /@import\s+(?:url\(\s*)?(?:["']([^"']+)["']|([^"'\s);]+))\s*\)?/gi;
    const imports = [];
    let m;
    while ((m = importRe.exec(out))) imports.push({ full: m[0], url: (m[1] || m[2] || '').trim() });
    for (const imp of imports) {
      if (isHttpUrl(imp.url)) {
        const text = await fetchText(imp.url, 'stylesheet');
        out = out.replace(imp.full, text != null ? await inlineCss(text, depth + 1) : '/* @import could not be loaded */');
      } else if (isRelativeUrl(imp.url)) {
        report(`Relative stylesheet "${imp.url}" could not be resolved from a local file.`);
        out = out.replace(imp.full, '/* @import could not be resolved */');
      }
    }
    const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
    const refs = [];
    while ((m = urlRe.exec(out))) refs.push({ full: m[0], url: m[2].trim() });
    for (const ref of refs) {
      const url = ref.url;
      if (isHttpUrl(url)) {
        const uri = await fetchInline(url, 'resource');
        out = out.replace(ref.full, uri ? `url("${uri}")` : 'url("")');
      } else if (isRelativeUrl(url)) {
        report(`Relative resource "${url}" in CSS could not be resolved from a local file.`);
      }
    }
    return out;
  };

  const styleEls = Array.from(svgElement.querySelectorAll('style'));
  for (const styleEl of styleEls) {
    styleEl.textContent = await inlineCss(styleEl.textContent || '');
  }

  // ----- inline <image> / <feImage> references ------------------------------
  for (const el of Array.from(svgElement.querySelectorAll('image, feImage'))) {
    const href = el.getAttribute('href') || el.getAttributeNS(XLINK_NS, 'href');
    if (!href) continue;
    if (isHttpUrl(href)) {
      const uri = await fetchInline(href, 'image');
      if (uri) {
        el.setAttribute('href', uri);
        el.removeAttributeNS(XLINK_NS, 'href');
      }
    } else if (isRelativeUrl(href)) {
      report(`Relative image "${href}" could not be resolved from a local file; it may be missing in the export.`);
    }
  }

  // External <use> references cannot be inlined reliably - warn about them.
  for (const el of Array.from(svgElement.querySelectorAll('use'))) {
    const href = el.getAttribute('href') || el.getAttributeNS(XLINK_NS, 'href');
    if (!href) continue;
    if (!isFragment(href)) {
      report(`External <use> reference "${href}" is not supported in video export; only same-document references render.`);
    }
  }

  // ----- feature detection --------------------------------------------------
  const hasScript = !!svgElement.querySelector('script');
  const hasForeignObject = !!svgElement.querySelector('foreignObject');
  if (hasScript) {
    report('SVG contains <script>. JavaScript-driven animation runs in real time during export and cannot be seeked; CSS keyframes and SMIL remain frame-accurate.');
  }
  if (hasForeignObject) {
    report('SVG contains <foreignObject>. Browsers do not render foreign objects inside video frames; only the SVG-native parts will appear.');
  }

  // ----- embedded @font-face fonts (for cache warming) ----------------------
  const fonts = [];
  for (const st of styleEls) {
    const css = st.textContent || '';
    const faceRe = /@font-face\s*\{([^}]*)\}/gi;
    let fm;
    while ((fm = faceRe.exec(css))) {
      const body = fm[1];
      const fam = body.match(/font-family\s*:\s*([^;]+)/i);
      const src = body.match(/url\(\s*(['"]?)(data:[^)'"]+)\1\s*\)/i);
      if (fam && src) fonts.push({ family: fam[1].trim().replace(/^["']|["']$/g, ''), src: src[2] });
    }
  }

  // ----- geometry -----------------------------------------------------------
  const geometry = getSvgGeometryFromElement(svgElement);

  const svg = new XMLSerializer().serializeToString(svgElement);

  return { svg, warnings, fonts, hasScript, hasForeignObject, geometry };
}

function getSvgGeometryFromElement(svgElement) {
  let w = 0;
  let h = 0;
  const vb = svgElement.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3]) && parts[2] > 0 && parts[3] > 0) {
      w = parts[2];
      h = parts[3];
    }
  }
  if (!w || !h) {
    const wNum = parseFloat(svgElement.getAttribute('width'));
    const hNum = parseFloat(svgElement.getAttribute('height'));
    if (Number.isFinite(wNum) && Number.isFinite(hNum) && wNum > 0 && hNum > 0) {
      w = wNum;
      h = hNum;
    }
  }
  if (!w || !h) { w = 1920; h = 1080; }
  return { w, h };
}

function fitSize(originalW, originalH, targetW, targetH) {
  const scale = Math.min(targetW / originalW, targetH / originalH);
  return {
    w: Math.max(1, Math.round(originalW * scale)),
    h: Math.max(1, Math.round(originalH * scale)),
  };
}

function waitForFonts(win, timeout) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    try {
      const fonts = win?.document?.fonts;
      if (fonts && fonts.ready && typeof fonts.ready.then === 'function') {
        fonts.ready.then(finish).catch(finish);
      } else {
        finish();
      }
    } catch { finish(); }
    setTimeout(finish, timeout);
  });
}

function waitForImages(svgEl, timeout) {
  const imgs = Array.from(svgEl.querySelectorAll('image'));
  if (!imgs.length) return Promise.resolve();
  return Promise.all(imgs.map((img) => new Promise((resolve) => {
    if (img.complete) return resolve();
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    img.addEventListener('load', finish, { once: true });
    img.addEventListener('error', finish, { once: true });
    setTimeout(finish, timeout);
  })));
}

// ---------------------------------------------------------------------------
// Render host: a hidden iframe that owns the live SVG document used to
// generate every export frame.
// ---------------------------------------------------------------------------
export async function createRenderHost({ svg, targetW, targetH, geometry }) {
  const geom = geometry || getSvgGeometryFromElement(parseSvgForGeometry(svg));
  const fit = fitSize(geom.w, geom.h, targetW, targetH);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.title = 'vectra-render-host';
  iframe.style.cssText =
    `position:fixed;left:-100000px;top:0;width:${fit.w}px;height:${fit.h}px;border:0;` +
    'visibility:hidden;pointer-events:none;background:transparent;';
  document.body.appendChild(iframe);

  let destroyed = false;
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    try { iframe.remove(); } catch {}
  }

  // Escape "</script" inside script bodies so embedding the SVG in srcdoc HTML
  // cannot terminate a script element early. The escape is invisible to JS
  // string literals ("<\/script" === "</script").
  const safeSvg = String(svg).replace(/<\/script/gi, '<\\/script');

  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}' +
    '</style></head><body>' + safeSvg + '</body></html>';
  iframe.srcdoc = html;

  await new Promise((resolve) => {
    iframe.addEventListener('load', resolve, { once: true });
    setTimeout(resolve, 8000);
  });

  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  const svgEl = doc && doc.querySelector('svg');
  if (!svgEl) {
    destroy();
    throw new Error('The SVG could not be loaded into the rendering engine. Check the SVG syntax and try again.');
  }

  // Explicit geometry: the render document and the rasterized <img> must see
  // the exact same viewport so percentage-based layouts match pixel for pixel.
  svgEl.setAttribute('width', String(fit.w));
  svgEl.setAttribute('height', String(fit.h));
  svgEl.style.width = '';
  svgEl.style.height = '';
  if (!svgEl.getAttribute('viewBox')) {
    svgEl.setAttribute('viewBox', `0 0 ${geom.w} ${geom.h}`);
  }
  for (const [attr, value] of [
    ['shape-rendering', 'geometricPrecision'],
    ['text-rendering', 'geometricPrecision'],
    ['image-rendering', 'optimizeQuality'],
    ['color-rendering', 'optimizeQuality'],
  ]) {
    if (!svgEl.getAttribute(attr)) svgEl.setAttribute(attr, value);
  }

  await Promise.all([
    waitForFonts(win, 8000),
    waitForImages(svgEl, 10000),
  ]);

  // ----- detect what needs per-frame treatment ------------------------------
  const allElements = [svgEl, ...svgEl.querySelectorAll('*')];
  const delayTargets = [];   // CSS-animated elements -> freeze via delay
  const bakeSet = new Set(); // elements whose computed style must be baked

  for (const el of allElements) {
    let cs = null;
    try { cs = win.getComputedStyle(el); } catch { continue; }
    const name = cs.animationName || cs.webkitAnimationName || 'none';
    const duration = parseTime(cs.animationDuration || cs.webkitAnimationDuration || '0s');
    const isAnimated = name !== 'none' && duration > 0;
    if (isAnimated) {
      const delays = String(cs.animationDelay || '0s').split(',').map((s) => parseTime(s.trim()));
      delayTargets.push({ el, delays });
      bakeSet.add(el);
      continue;
    }
    const transitionDur = parseTime(cs.transitionDuration || cs.webkitTransitionDuration || '0s');
    const transitionProps = String(cs.transitionProperty || '').trim();
    if (transitionDur > 0 && transitionProps !== '' && transitionProps !== 'none' && transitionProps !== 'all') {
      bakeSet.add(el); // capture the current mid-transition state
    }
  }

  // SMIL targets: attribute values are baked by the clone, but SMIL animations
  // of CSS properties (attributeName="opacity" etc.) only exist in computed
  // style, so those elements must be baked too.
  for (const anim of svgEl.querySelectorAll('animate, animateTransform, animateMotion, animateColor, set')) {
    const href = anim.getAttribute('href') || anim.getAttributeNS(XLINK_NS, 'href');
    let target = null;
    if (href && href.startsWith('#')) {
      try { target = doc.getElementById(href.slice(1)); } catch {}
    }
    if (!target) target = anim.parentElement;
    if (target) bakeSet.add(target);
  }

  const hasSmil = svgEl.querySelectorAll('animate, animateTransform, animateMotion, animateColor, set').length > 0;
  const isStatic = delayTargets.length === 0 && bakeSet.size === 0 && !hasSmil;

  // ----- frame capture ------------------------------------------------------
  const captureFrame = (timeSeconds) => {
    const t = Number(timeSeconds) || 0;

    // 1. Seek SMIL to the exact frame time.
    try {
      if (typeof svgEl.setCurrentTime === 'function') svgEl.setCurrentTime(t);
    } catch {}

    // 2. Freeze CSS animations at the exact frame time. The delay is computed
    //    from each element's ORIGINAL delay (captured at init), so multiple
    //    simultaneous animations and per-animation delays stay correct.
    for (const ft of delayTargets) {
      const adjusted = ft.delays.map((d) => `${(d - t).toFixed(6)}s`).join(', ');
      try {
        ft.el.style.animationDelay = adjusted;
        ft.el.style.webkitAnimationDelay = adjusted;
        ft.el.style.animationPlayState = 'paused';
        ft.el.style.webkitAnimationPlayState = 'paused';
      } catch {}
    }

    // 3. Force layout so computed styles reflect the frozen frame.
    try { svgEl.getBoundingClientRect(); } catch {}

    // 4. Clone the frozen live document.
    const clone = svgEl.cloneNode(true);

    // 5. Neutralize CSS animation/transition in the clone so nothing can
    //    re-animate when the frame is rasterized.
    const neutral = doc.createElementNS(SVG_NS, 'style');
    neutral.setAttribute('id', 'vectra-frame-neutralize');
    neutral.textContent = '*, *::before, *::after { animation: none !important; -webkit-animation: none !important; transition: none !important; -webkit-transition: none !important; }';
    clone.appendChild(neutral);

    // 6. Scripts already ran in the live document; SMIL values are baked into
    //    the cloned attributes/computed styles, so both are removed.
    clone.querySelectorAll('script').forEach((n) => n.remove());
    clone.querySelectorAll('animate, animateTransform, animateMotion, animateColor, set').forEach((n) => n.remove());

    // 7. Bake the full computed style of every animated element onto the clone
    //    (parallel walk - the clone preserves the live tree structure).
    bakeWalker(win, svgEl, clone, bakeSet);

    // 8. Explicit geometry + drop any inline width/height the source set.
    clone.setAttribute('width', String(fit.w));
    clone.setAttribute('height', String(fit.h));
    clone.style.width = '';
    clone.style.height = '';

    return new XMLSerializer().serializeToString(clone);
  };

  return { destroy, captureFrame, isStatic, fitW: fit.w, fitH: fit.h, win };
}

function parseSvgForGeometry(svg) {
  try {
    return new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  } catch {
    return null;
  }
}

const BAKE_SKIP = /^(animation|transition|-webkit-animation|-webkit-transition|-moz-animation|-o-transition)/i;

function bakeComputedStyle(win, liveEl, cloneEl) {
  let cs;
  try { cs = win.getComputedStyle(liveEl); } catch { return; }
  const style = cloneEl.style;
  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    if (BAKE_SKIP.test(prop)) continue;
    const value = cs.getPropertyValue(prop);
    if (!value) continue;
    try {
      style.setProperty(prop, value, cs.getPropertyPriority(prop));
    } catch {}
  }
}

function bakeWalker(win, liveEl, cloneEl, bakeSet) {
  if (bakeSet.has(liveEl)) bakeComputedStyle(win, liveEl, cloneEl);
  const liveChildren = liveEl.children;
  const cloneChildren = cloneEl.children;
  const n = Math.min(liveChildren.length, cloneChildren.length);
  for (let i = 0; i < n; i++) {
    bakeWalker(win, liveChildren[i], cloneChildren[i], bakeSet);
  }
}

// ---------------------------------------------------------------------------
// Blank-frame analysis: sample a small downscaled copy of the rendered SVG
// content (before the user background/watermark is applied) and report how
// much of the frame is actually painted.
// ---------------------------------------------------------------------------
export function sampleFrameStats(canvas, sampleW = 128, sampleH = 72) {
  const off = document.createElement('canvas');
  off.width = sampleW;
  off.height = sampleH;
  const octx = off.getContext('2d', { willReadFrequently: true });
  octx.drawImage(canvas, 0, 0, sampleW, sampleH);
  const data = octx.getImageData(0, 0, sampleW, sampleH).data;
  let covered = 0;
  let sumLuma = 0;
  let sumLuma2 = 0;
  const n = sampleW * sampleH;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 8) covered++;
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sumLuma += luma;
    sumLuma2 += luma * luma;
  }
  const meanLuma = sumLuma / n;
  const variance = Math.max(0, sumLuma2 / n - meanLuma * meanLuma);
  return { coverage: covered / n, meanLuma, variance, sampleW, sampleH };
}

// A frame counts as blank when essentially nothing is painted:
//   - transparent content: virtually no opaque pixels;
//   - opaque content: virtually no color variation (a uniform frame).
export function isFrameBlank(stats, opts = {}) {
  if (!stats) return true;
  const { coverageThreshold = 0.0002, varianceThreshold = 1e-3 } = opts;
  if (stats.coverage < coverageThreshold) return true;
  if (stats.variance < varianceThreshold) return true;
  return false;
}

export function describeFrameStats(stats) {
  if (!stats) return 'no frame data';
  return `coverage ${(stats.coverage * 100).toFixed(3)}%, color variance ${stats.variance.toFixed(4)}`;
}
