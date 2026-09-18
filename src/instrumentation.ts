/**
 * Boot hook for the Next.js server (runs for `next dev` and `next start`).
 *
 * Next compiles this file for BOTH the Node.js and Edge runtimes, so every
 * Node-only import must stay behind a runtime check. The actual encoder
 * spawn lives in instrumentation-node.ts, imported dynamically only when
 * NEXT_RUNTIME === "nodejs" — that keeps node:child_process/node:path out
 * of the Edge bundle and silences the "not supported in the Edge Runtime"
 * warnings.
 */
export async function register() {
  // Only the Node.js server runtime can host the encoder; skip on Edge.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerNode } = await import("./instrumentation-node");
    await registerNode();
  }
}
