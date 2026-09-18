# ---------------------------------------------------------------------------
# StockPulse - Next.js app + local FFmpeg encoder (MP4 export capable)
#
# Build:  docker build -t stockpulse .
# Run:    docker run -d -p 3000:3000 --name stockpulse stockpulse
#
# The container runs `next start`; src/instrumentation.ts spawns the FFmpeg
# encoder child process automatically. The browser talks to /api/encoder/* on
# this origin, which the Next server proxies to 127.0.0.1:3030.
#
# Uses Debian slim (glibc) because the ffmpeg-static binary does not run on
# Alpine/musl.
# ---------------------------------------------------------------------------
FROM node:22-slim AS base

# Next.js collects anonymous telemetry; keep the image quiet and lean.
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json package-lock.json next.config.ts ./
COPY encoder-server.cjs ./

# ffmpeg-static ships its binary inside node_modules; ensure execute perms.
RUN chmod -R +x node_modules/ffmpeg-static/ || true

USER nextjs
EXPOSE 3000
CMD ["npm", "run", "start"]
