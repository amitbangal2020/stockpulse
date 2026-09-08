const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const app = express();
const PORT = 3030;
const sessions = new Map();

app.use((req, res, next) => {
  // Echo the request origin (or allow all when none is sent, e.g. curl).
  // The Vite dev server may be reached as http://localhost:5173 or
  // http://127.0.0.1:5173 depending on how the browser resolves the host,
  // so a hard-coded origin would make a healthy encoder look unreachable.
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true, encoder: 'FFmpeg/libx264' }));
app.use('/api/encode', express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// /api/fetch - tiny local proxy used by the frontend to inline external
// resources (web fonts, images, stylesheets) that the browser cannot reach
// directly because of CORS. The SVG render pipeline converts these into
// data: URIs so frames are fully self-contained when rasterized.
// ---------------------------------------------------------------------------
const MAX_INLINE_BYTES = 60 * 1024 * 1024;
app.get('/api/fetch', async (req, res) => {
  const url = String(req.query.url || '').trim();
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http(s) URLs can be fetched.' });
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const upstream = await fetch(url, { redirect: 'follow', signal: controller.signal });
    clearTimeout(timer);
    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream responded with status ${upstream.status}.` });
    }
    const length = Number(upstream.headers.get('content-length') || 0);
    if (length > MAX_INLINE_BYTES) {
      return res.status(413).json({ error: 'Resource is too large to inline (limit 60 MB).' });
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    if (buffer.length > MAX_INLINE_BYTES) {
      return res.status(413).json({ error: 'Resource is too large to inline (limit 60 MB).' });
    }
    const upstreamType = String(upstream.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim();
    res.setHeader('Content-Type', upstreamType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: err.name === 'AbortError' ? 'Fetch timed out.' : err.message });
  }
});

// Optional debug aid: keep a copy of every finished MP4 next to the app so
// exports can be verified with ffprobe/ffmpeg without the browser download.
const debugExportDir = process.env.VECTRA_DEBUG_EXPORT_DIR ? path.resolve(process.env.VECTRA_DEBUG_EXPORT_DIR) : null;
if (debugExportDir) {
  try { fs.mkdirSync(debugExportDir, { recursive: true }); } catch {}
  console.log(`Debug exports will be saved to: ${debugExportDir}`);
}

function safeName(name) {
  return String(name || 'animation').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'animation';
}

function cleanup(session) {
  if (!session) return;
  try { fs.rmSync(session.dir, { recursive: true, force: true }); } catch {}
  sessions.delete(session.id);
}

function waitForClose(child) {
  return new Promise((resolve, reject) => {
    let stderr = '';
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-4000)}`));
    });
  });
}

app.post('/api/encode/start', (req, res) => {
  try {
    const { width, height, fps, duration, bitrate, totalFrames, filename } = req.body || {};
    const W = Math.round(Number(width));
    const H = Math.round(Number(height));
    const FPS = Number(fps);
    const DURATION = Number(duration);
    const BITRATE = Number(bitrate);
    const FRAMES = Math.round(Number(totalFrames));

    if (!W || !H || !FPS || !DURATION || !BITRATE || !FRAMES) {
      return res.status(400).json({ error: 'Invalid encode parameters.' });
    }
    if (W > 7680 || H > 4320 || FPS > 120 || BITRATE > 200_000_000) {
      return res.status(400).json({ error: 'Encode settings exceed safe local limits.' });
    }

    const id = crypto.randomUUID();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vectravideo-'));
    const outputPath = path.join(dir, `${safeName(filename)}.mp4`);
    const audioPath = path.join(dir, 'audio-input');

    const session = {
      id, dir, outputPath, audioPath,
      width: W, height: H, fps: FPS, duration: DURATION,
      bitrate: BITRATE, totalFrames: FRAMES,
      filename: safeName(filename), child: null, frameCount: 0,
      audioReady: false, started: false,
    };
    sessions.set(id, session);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/encode/:id/audio', express.raw({ type: '*/*', limit: '500mb' }), (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Encode session not found.' });
  try {
    fs.writeFileSync(s.audioPath, req.body);
    s.audioReady = true;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function startFfmpeg(s) {
  const args = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-framerate', String(s.fps),
    '-i', 'pipe:0',
  ];

  if (s.audioReady) {
    args.push('-i', s.audioPath);
  }

  args.push(
    '-map', '0:v:0',
    ...(s.audioReady ? ['-map', '1:a:0'] : []),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-profile:v', 'high',
    '-level:v', '5.2',
    '-pix_fmt', 'yuv420p',
    '-r', String(s.fps),
    '-frames:v', String(s.totalFrames),
    '-b:v', `${Math.round(s.bitrate / 1_000_000)}M`,
    '-minrate', `${Math.round(s.bitrate / 1_000_000)}M`,
    '-maxrate', `${Math.round(s.bitrate / 1_000_000)}M`,
    '-bufsize', `${Math.round((s.bitrate * 2) / 1_000_000)}M`,
    '-g', String(Math.max(1, Math.round(s.fps * 2))),
    '-keyint_min', String(Math.max(1, Math.round(s.fps))),
    '-sc_threshold', '0',
    '-x264-params', 'nal-hrd=cbr:force-cfr=1',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
  );

  if (s.audioReady) {
    args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest');
  }

  args.push('-movflags', '+faststart', s.outputPath);

  s.child = spawn(ffmpegPath, args, { stdio: ['pipe', 'ignore', 'pipe'] });
  // If FFmpeg exits early (invalid input, killed, OOM, ...) any subsequent
  // stdin writes surface as an 'error' event; keep a no-op listener so an
  // EPIPE cannot crash the whole server process.
  s.child.stdin.on('error', () => {});
  s.started = true;
  s.ffmpegPromise = waitForClose(s.child);
}

app.post('/api/encode/:id/frame', express.raw({ type: 'image/png', limit: '20mb' }), async (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Encode session not found.' });

  try {
    if (!s.started) await startFfmpeg(s);
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      throw new Error('Empty PNG frame received.');
    }

    if (!s.child.stdin.write(req.body)) {
      await new Promise((resolve, reject) => {
        const onDrain = () => { cleanupListeners(); resolve(); };
        const onError = err => { cleanupListeners(); reject(err); };
        const cleanupListeners = () => {
          s.child.stdin.off('drain', onDrain);
          s.child.stdin.off('error', onError);
        };
        s.child.stdin.once('drain', onDrain);
        s.child.stdin.once('error', onError);
      });
    }

    s.frameCount++;
    res.json({ ok: true, frame: s.frameCount });
  } catch (err) {
    try { s.child?.stdin?.destroy(); } catch {}
    cleanup(s);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/encode/:id/finish', async (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Encode session not found.' });

  try {
    if (!s.started) throw new Error('No video frames were received.');
    if (s.frameCount !== s.totalFrames) {
      throw new Error(`Expected ${s.totalFrames} frames but received ${s.frameCount}.`);
    }

    s.child.stdin.end();
    await s.ffmpegPromise;

    if (debugExportDir) {
      try {
        const debugPath = path.join(debugExportDir, `${s.filename}-${s.id.slice(0, 8)}.mp4`);
        fs.copyFileSync(s.outputPath, debugPath);
      } catch (err) {
        console.warn('Could not save debug export:', err.message);
      }
    }

    const stat = fs.statSync(s.outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', String(stat.size));
    res.setHeader('Content-Disposition', `attachment; filename="${s.filename}.mp4"`);
    const stream = fs.createReadStream(s.outputPath);
    stream.on('close', () => cleanup(s));
    stream.pipe(res);
  } catch (err) {
    cleanup(s);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.post('/api/encode/:id/cancel', (req, res) => {
  const s = sessions.get(req.params.id);
  if (s?.child) {
    try { s.child.kill('SIGKILL'); } catch {}
    // The FFmpeg child was intentionally killed; swallow the resulting
    // rejected promise so it cannot crash the server as an unhandled
    // rejection (Node >= 15 exits on unhandled rejections by default).
    if (s.ffmpegPromise) s.ffmpegPromise.catch(() => {});
  }
  cleanup(s);
  res.json({ ok: true });
});

// Defensive: never let an unhandled promise rejection take down the encoder
// while an export is in flight.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in encoder server:', reason instanceof Error ? reason.message : reason);
});

const listener = app.listen(PORT, '127.0.0.1', () => {
  console.log(`VectraVideo native encoder: http://127.0.0.1:${PORT}`);
  console.log(`FFmpeg: ${ffmpegPath}`);
});

// If another encoder instance is already listening (e.g. the frontend
// launcher started one and the Vite auto-start plugin raced it), exit
// quietly instead of crashing with a noisy EADDRINUSE stack trace.
listener.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[VectraVideo] Port ${PORT} is already in use - an encoder is already running; this duplicate instance is exiting.`);
    process.exit(0);
  }
  console.error('[VectraVideo] Encoder failed to start:', err.message);
  process.exit(1);
});
