"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";

// Self-exclusion for the site owner's own browsers.
// Visit https://www.abanti.in/#no-analytics once — the flag is stored in
// localStorage and this browser stops reporting analytics from then on.
// Repeat in any other browser/device you use. Visitors are unaffected.
const OPT_OUT_KEY = "sp-analytics-opt-out";

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
  return <Analytics />;
}
