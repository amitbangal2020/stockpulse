"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SettingsDrawer } from "@/components/settings-drawer";

/**
 * Tool shell: one top nav row (AppNav) and then the tool itself. Pages own
 * their headings, so there is no separate heading strip in the shell.
 */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Single-row top navigation */}
      <AppNav />

      {/* Page content — stacked on mobile, side-by-side row on desktop.
          Keyed by pathname so navigation fades in smoothly. */}
      <div
        key={pathname}
        className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden min-h-0 animate-page-fade"
      >
        {children}
      </div>

      {/* Mobile-only: turns the right settings panel into a slide-up drawer */}
      <SettingsDrawer />
    </div>
  );
}
