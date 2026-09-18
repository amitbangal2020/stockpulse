"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { TopTabs } from "@/components/top-tabs";

export function ToolLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden min-h-0">
      {/* Persistent Left Sidebar (desktop) + mobile top bar (AppSidebar renders both) */}
      <AppSidebar />

      {/* Right Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:overflow-hidden min-h-0">
        {/* Top Tab Bar */}
        <TopTabs />

        {/* Tool Content — stacked on mobile, side-by-side row on desktop (original behaviour).
            Keyed by pathname so navigation fades in smoothly. */}
        <div
          key={pathname}
          className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden min-h-0 animate-fade-in"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
