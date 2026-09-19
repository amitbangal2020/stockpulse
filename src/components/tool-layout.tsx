"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { TopTabs } from "@/components/top-tabs";
import { SettingsDrawer } from "@/components/settings-drawer";

/**
 * Tool shell: a horizontal top nav (AppNav) above a slim page heading strip
 * (TopTabs). Content keeps the desktop row layout the tools rely on, with the
 * right-hand settings panel becoming a slide-up drawer on phones.
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Horizontal top navigation — brand, sections, tools launcher */}
      <AppNav />

      {/* Page column under the nav */}
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden min-h-0">
        {/* Page heading strip */}
        <TopTabs />

        {/* Tool Content — stacked on mobile, side-by-side row on desktop (original behaviour).
            Keyed by pathname so navigation fades in smoothly. */}
        <div
          key={pathname}
          className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden min-h-0 animate-page-fade"
        >
          {children}
        </div>
      </div>

      {/* Mobile-only: turns the right settings panel into a slide-up drawer */}
      <SettingsDrawer />
    </div>
  );
}
