import { track as vercelTrack } from "@vercel/analytics";

/**
 * Thin wrapper around Vercel Analytics custom events.
 *
 * Why a wrapper:
 * - one place to rename events or swap providers later,
 * - never throws: analytics must not break a tool mid-generation,
 * - no-ops in dev so local testing doesn't pollute production analytics
 *   (Vercel's track() already ignores localhost, this makes the intent
 *   explicit and keeps the console clean).
 *
 * Event naming convention: snake_case, object_action — matches what the
 * Vercel dashboard displays, e.g. "generate_all_started".
 */

type AnalyticsEvent =
  | "generate_started"
  | "generate_completed"
  | "generate_failed"
  | "csv_downloaded"
  | "language_switched"
  | "api_key_added"
  | "asset_tracked"
  | "portfolio_refreshed";

export function trackEvent(name: AnalyticsEvent, payload?: Record<string, string | number | boolean>) {
  try {
    if (process.env.NODE_ENV !== "production") return;
    vercelTrack(name, payload);
  } catch {
    /* analytics must never break the tool */
  }
}
