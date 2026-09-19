import type { ReactNode } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { ForceLocale } from "@/components/force-locale";

/**
 * Bengali section (/bn/*).
 *
 * Trade-off worth knowing: Next only lets the *root* layout render <html lang>,
 * so these pages still ship lang="en" in the raw markup — the hreflang pairs
 * (which is the signal Google actually uses) are emitted per page, and the
 * pre-paint script in the root layout stamps lang="bn" for /bn paths before
 * first paint. Changing the raw attribute would mean moving every existing
 * route into a route group with its own root layout — not worth that churn.
 */
export default function BengaliLayout({ children }: { children: ReactNode }) {
  return (
    <ToolLayout>
      <ForceLocale locale="bn" />
      {children}
    </ToolLayout>
  );
}
