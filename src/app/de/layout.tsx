import type { ReactNode } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { ForceLocale } from "@/components/force-locale";

/**
 * German section (/de/*).
 *
 * Same trade-off as /bn and /hi: Next only lets the *root* layout render
 * <html lang>, so these pages still ship lang="en" in the raw markup — the
 * hreflang pairs (which is the signal Google actually uses) are emitted per
 * page, and the pre-paint script in the root layout stamps lang="de" for /de
 * paths before first paint.
 */
export default function GermanLayout({ children }: { children: ReactNode }) {
  return (
    <ToolLayout>
      <ForceLocale locale="de" />
      {children}
    </ToolLayout>
  );
}
