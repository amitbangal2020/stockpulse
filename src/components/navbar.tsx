"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Menu,
  X,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { label: "MetaGen", href: "/metagen" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Trending", href: "/trending" },
  { label: "Keywords", href: "/keywords" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 glass">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-md shadow-accent/20 transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Stock<span className="text-accent">Pulse</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-accent-subtle hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-all hover:border-accent hover:text-accent hover:shadow-sm"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>

          {/* Auth Buttons */}
          <Link
            href="/signin"
            className="hidden h-9 items-center rounded-xl px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:flex"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="hidden h-9 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 sm:flex"
          >
            Sign Up
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:text-text-primary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-accent-subtle hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            <Link
              href="/signin"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-accent px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
