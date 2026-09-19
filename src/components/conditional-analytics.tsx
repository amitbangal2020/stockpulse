"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

// Self-exclusion for the site owner's own browsers.
// Visit https://www.abanti.in/#no-analytics once — the flag is stored in
// localStorage and this browser stops reporting analytics from then on.
// Repeat in any other browser/device you use. Visitors are unaffected.
const OPT_OUT_KEY = "sp-analytics-opt-out";

// Optional Google Analytics 4 — set NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXXXXX)
// to enable. GA4 carries the custom events Vercel's Hobby plan won't show.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function ConditionalAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.location.hash === "#no-analytics") {
      localStorage.setItem(OPT_OUT_KEY, "1");
      // Remove the hash so it doesn't linger in the address bar
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setEnabled(localStorage.getItem(OPT_OUT_KEY) !== "1");
  }, []);

  if (!enabled) return null;
  return (
    <>
      <Analytics />
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
