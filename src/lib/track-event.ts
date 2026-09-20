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
 *
 * Dual tracking: Vercel Web Analytics gates custom events behind the Pro
 * plan, so the same events are mirrored to Google Analytics 4 when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set (free, unlimited events). Both
 * respect the site-owner opt-out stored by ConditionalAnalytics.
 */

type AnalyticsEvent =
  | "generate_started"
  | "generate_completed"
  | "generate_failed"
  | "csv_downloaded"
  | "language_switched"
  | "api_key_added"
  | "asset_tracked"
  | "portfolio_refreshed"
  | "event_prompt_copied";

const OPT_OUT_KEY = "sp-analytics-opt-out";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackEvent(name: AnalyticsEvent, payload?: Record<string, string | number | boolean>) {
  try {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window !== "undefined" && localStorage.getItem(OPT_OUT_KEY) === "1") return;

    vercelTrack(name, payload);

    // GA4 mirror — gtag is loaded by ConditionalAnalytics when the ID is set.
    if (GA_ID && typeof window !== "undefined") {
      const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
      w.gtag?.("event", name, payload ?? {});
    }
  } catch {
    /* analytics must never break the tool */
  }
}
