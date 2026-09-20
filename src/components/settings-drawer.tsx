"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

/**
 * Mobile-only settings drawer.
 *
 * On phones the desktop right-hand settings panel (`.tool-settings-panel`) is
 * hidden by CSS; this component adds a floating button that turns it into a
 * slide-up sheet, so every control stays reachable without a long scroll.
 */
export function SettingsDrawer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);

  // Only show the button on pages that actually render a settings panel.
  useEffect(() => {
    setAvailable(!!document.querySelector(".tool-settings-panel"));
  }, [pathname]);

  // Reflect the open state on <html> so plain CSS can move the panel.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("settings-drawer-open", open);
    return () => root.classList.remove("settings-drawer-open");
  }, [open]);

  // Always close when the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Play a closing animation before unmounting so the drawer doesn't "cut" out.
  const [closing, setClosing] = useState(false);
  const closeWithAnimation = () => {
    if (!open) return;
    setClosing(true);
    document.documentElement.classList.add("settings-drawer-closing");
    setTimeout(() => {
      document.documentElement.classList.remove("settings-drawer-closing");
      setClosing(false);
      setOpen(false);
    }, 200);
  };

  if (!available) return null;

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 z-[54] bg-black/40 lg:hidden ${closing ? "pointer-events-none" : ""}`}
          onClick={closeWithAnimation}
          aria-hidden
        />
      )}

      <button
        data-settings-toggle
        onClick={() => (open ? closeWithAnimation() : setOpen(true))}
        aria-expanded={open}
        aria-label={open ? t.drawer.closeAria : t.drawer.openAria}
        className={`fixed bottom-5 right-4 z-[60] flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition-all lg:hidden ${
          open
            ? "border border-border bg-surface text-text-primary shadow-black/10"
            : "bg-accent text-white shadow-accent/30"
        }`}
      >
        {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        {open ? t.drawer.close : t.drawer.open}
      </button>
    </>
  );
}
