import type { ReactNode } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { ForceLocale } from "@/components/force-locale";

/**
 * Hindi section (/hi/*).
 *
 * Same trade-off as /bn: Next only lets the *root* layout render <html lang>,
 * so these pages still ship lang="en" in the raw markup — the hreflang pairs
 * (which is the signal Google actually uses) are emitted per page, and the
 * pre-paint script in the root layout stamps lang="hi" for /hi paths before
 * first paint.
 */
export default function HindiLayout({ children }: { children: ReactNode }) {
  return (
    <ToolLayout>
      <ForceLocale locale="hi" />
      {children}
    </ToolLayout>
  );
}
