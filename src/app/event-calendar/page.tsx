"use client";

import { useMemo, useState } from "react";
import { Calendar, Check, ChevronDown, Clock, MapPin, Pencil, Search } from "lucide-react";
import { ToolLayout } from "@/components/tool-layout";
import { useLanguage } from "@/components/language-provider";
import { format } from "@/lib/i18n/messages";
import {
  buildEventPrompt,
  CALENDAR_EVENTS,
  EVENT_CATEGORIES,
  type CalendarEvent,
  type EventCategory,
} from "@/lib/event-calendar";
import { trackEvent } from "@/lib/track-event";

// Category badge colors, keyed by EventCategory.
const CATEGORY_STYLES: Record<EventCategory, string> = {
  international: "bg-blue-500/10 text-blue-600",
  national: "bg-indigo-500/10 text-indigo-600",
  religious: "bg-violet-500/10 text-violet-600",
  cultural: "bg-teal-500/10 text-teal-600",
  fun: "bg-pink-500/10 text-pink-600",
  food: "bg-orange-500/10 text-orange-600",
  health: "bg-green-500/10 text-green-600",
  business: "bg-amber-500/10 text-amber-600",
  awareness: "bg-red-500/10 text-red-600",
  family: "bg-rose-500/10 text-rose-600",
  technology: "bg-cyan-500/10 text-cyan-600",
};

// Emoji per category for the dropdown, matching the reference calendar UX.
const CATEGORY_EMOJI: Record<EventCategory, string> = {
  international: "🌍",
  national: "🚩",
  religious: "🕌",
  cultural: "🎭",
  fun: "🎉",
  food: "🍽️",
  health: "🩺",
  business: "💼",
  awareness: "🎗️",
  family: "👪",
  technology: "💻",
};

const LOCALE_TAGS: Record<string, string> = {
  en: "en-US",
  bn: "bn-BD",
  hi: "hi-IN",
  fr: "fr-FR",
  de: "de-DE",
};

const PAGE_SIZE = 24;

function EventCard({ event, monthLabel, categoryLabel, ideaLabel, copyLabel, copiedLabel }: {
  event: CalendarEvent;
  monthLabel: string;
  categoryLabel: string;
  ideaLabel: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildEventPrompt(event));
    } catch {
      /* clipboard unavailable — silently ignore, the UI state still shows */
    }
    trackEvent("event_prompt_copied", { event: event.title.slice(0, 40) });
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5">
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[event.category]}`}>
          {categoryLabel}
        </span>
        <div className="shrink-0 rounded-lg border border-border bg-bg px-2 py-1 text-center leading-none">
          <div className="text-[8px] font-bold uppercase tracking-wider text-text-muted">{monthLabel}</div>
          <div className="mt-0.5 text-base font-extrabold text-text-primary">{String(event.day).padStart(2, "0")}</div>
        </div>
      </div>

      <h3 className="mt-2.5 line-clamp-2 min-h-[2.6rem] font-heading text-[15px] font-bold leading-snug text-text-primary">{event.title}</h3>

      <div className="mt-3 flex-1">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-text-muted">
          <MapPin className="h-3 w-3 text-accent" />
          {ideaLabel}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">{event.stockIdea}</p>
      </div>

      <button
        onClick={copyPrompt}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-accent transition-all hover:bg-accent hover:text-white"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3 w-3" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

export default function EventCalendarPage() {
  const { t: tDict, locale } = useLanguage();
  const ev = tDict.events;

  // Today pill — localized long date (e.g. "Sun, Sep 20, 2026" / "রবি, সেপ্টে ২০, ২০২৬").
  // Deterministic within a day, so SSR/CSR markup always matches.
  const todayLabel = new Date().toLocaleDateString(LOCALE_TAGS[locale] ?? "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<number | "all">("all");
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CALENDAR_EVENTS.filter((event) => {
      if (month !== "all" && event.month !== month) return false;
      if (category !== "all" && event.category !== category) return false;
      if (q && !(`${event.title} ${event.stockIdea}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [query, month, category]);

  const shown = filtered.slice(0, visible);

  const resetPaging = (apply: () => void) => {
    apply();
    setVisible(PAGE_SIZE);
  };

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col lg:overflow-y-auto">
        {/* Header */}
        <div className="sticky top-[var(--shell-top)] z-20 border-b border-border bg-bg px-5 py-2.5 lg:top-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Calendar className="h-4 w-4 text-accent" />
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 className="text-sm font-semibold text-text-primary">{ev.title}</h2>
              <span aria-hidden className="hidden text-[11px] text-border sm:inline">·</span>
              <p className="text-[11px] text-text-muted">{ev.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-b border-border bg-bg px-5 py-3">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => resetPaging(() => setQuery(e.target.value))}
                placeholder={ev.searchPlaceholder}
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <select
              value={month}
              onChange={(e) => resetPaging(() => setMonth(e.target.value === "all" ? "all" : Number(e.target.value)))}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">{ev.allMonths}</option>
              {ev.months.map((name, i) => (
                <option key={name + i} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => resetPaging(() => setCategory(e.target.value as EventCategory | "all"))}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="all">{ev.allCategories}</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_EMOJI[cat]} {ev.categories[cat]}</option>
              ))}
            </select>
          </div>
          <div className="mx-auto mt-2.5 flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-border bg-accent-subtle px-3 py-1 text-[11px] font-semibold text-text-secondary">
              {format(ev.eventCount, { count: filtered.length })}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-text-secondary">
              <Clock className="h-3 w-3 text-accent" />
              {todayLabel}
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="flex-1 p-5">
          <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                monthLabel={ev.months[event.month - 1]}
                categoryLabel={ev.categories[event.category]}
                ideaLabel={ev.stockIdea}
                copyLabel={ev.copyPrompt}
                copiedLabel={ev.copied}
              />
            ))}
          </div>

          {shown.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm text-text-muted">{format(ev.eventCount, { count: 0 })}</p>
            </div>
          )}

          {filtered.length > visible && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-subtle px-5 py-2.5 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white"
              >
                {ev.loadMore}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
