"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "scroll to top" button for scrollable tool pages.
 * Watches BOTH the given container (desktop: the page's inner overflow-y-auto
 * div inside ToolLayout) and the window (mobile: the whole page scrolls).
 * Appears after 300px of scroll and smooth-scrolls whichever is offset.
 * Styling matches the search page's inline button exactly.
 */
export function ScrollTopButton({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    const onScroll = () => {
      const containerY = el?.scrollTop ?? 0;
      const windowY = typeof window !== "undefined" ? window.scrollY : 0;
      setShow(Math.max(containerY, windowY) > 300);
    };
    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [containerRef]);

  const toTop = useCallback(() => {
    const el = containerRef.current;
    if (el && el.scrollTop > 0) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [containerRef]);

  if (!show) return null;
  return (
    <button
      onClick={toTop}
      className="fixed bottom-24 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all hover:scale-110 hover:shadow-xl animate-pop-in"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
