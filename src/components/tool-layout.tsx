"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { TopTabs } from "@/components/top-tabs";

export function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Persistent Left Sidebar */}
      <AppSidebar />

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {/* Top Tab Bar */}
        <TopTabs />

        {/* Tool Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">{children}</div>
      </div>
    </div>
  );
}
