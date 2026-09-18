/**
 * Node.js-runtime-only boot logic for the SVG-to-Video encoder.
 *
 * This module is ONLY imported from instrumentation.ts when NEXT_RUNTIME is
 * "nodejs", so `node:child_process` / `node:path` never appear in the Edge
 * bundle and Next stops warning about them.
 *
 * The SVG-to-Video tool renders frames in the browser and pipes them to a
 * local FFmpeg process listening on http://127.0.0.1:3030
 * (see encoder-server.cjs). Spawning it here means `npm run dev` is the only
 * command needed - the UI's encoder badge flips to "Ready" as soon as this
 * child answers /health.
 */
export async function registerNode() {
  // Serverless platforms (Vercel, Lambda, Netlify functions) cannot host a
  // long-lived TCP server + FFmpeg child process. Skip spawning there; the
  // frontend detects the missing /health endpoint and steers users to
  // WebM/GIF exports with a clear explanation.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    console.log("[encoder] Serverless environment detected - FFmpeg encoder disabled (deploy to a VPS/Docker for MP4 export).");
    return;
  }

  const { spawn } = await import("node:child_process");
  const path = await import("node:path");

  const serverPath = path.join(process.cwd(), "encoder-server.cjs");
  const child = spawn(process.execPath, [serverPath], {
    stdio: "inherit",
    env: process.env,
  });

  // A missing script or runtime must never take the Next.js server down;
  // the UI already reports the encoder as offline via its /health poll.
  child.on("error", () => {});

  // Best-effort cleanup on graceful shutdown. Ctrl+C kills the whole console
  // process group on Windows/POSIX, which covers interactive dev usage.
  process.once("exit", () => {
    try {
      child.kill();
    } catch {
      // Ignore - the child may already be gone.
    }
  });

  console.log("[encoder] Spawning local FFmpeg encoder (encoder-server.cjs)...");
}
