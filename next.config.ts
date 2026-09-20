import type { NextConfig } from "next";

// Origin of the FFmpeg encoder server started by src/instrumentation.ts.
// Defaults to the same machine; set ENCODER_ORIGIN (e.g. http://encoder:3030)
// to point at a dedicated encoder host.
const ENCODER_ORIGIN = process.env.ENCODER_ORIGIN || "http://127.0.0.1:3030";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Proxy the FFmpeg encoder through this Next.js server. The browser
      // always talks to its own origin, so the SVG-to-Video tool works
      // identically on localhost and on the live site.
      {
        source: "/api/encoder/:path*",
        destination: `${ENCODER_ORIGIN}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      // The old basic events page is superseded by the rich event-calendar
      // planner. A permanent 308 keeps any earned SEO signals flowing to it.
      { source: "/events", destination: "/event-calendar", permanent: true },
      // Legacy bot-guessed homepage paths (index.php / index) show up as 404s
      // in Search Console. They carry no links, but pointing them at the
      // homepage cleans the report and drops any stray signal on "/".
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/index", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
