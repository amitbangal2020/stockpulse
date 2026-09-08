"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ToolLayout } from "@/components/tool-layout";

// ─── Events Data ───
const EVENTS: Record<string, { day: number; title: string }[]> = {
  "2026-01": [
    { day: 1, title: "New Year's Day" },
    { day: 5, title: "National Bird Day" },
    { day: 12, title: "National Mentoring Day" },
    { day: 15, title: "Martin Luther King Jr. Day" },
    { day: 19, title: "Popcorn Day" },
    { day: 21, title: "National Hug Day" },
    { day: 24, title: "National Compliment Day" },
    { day: 26, title: "Australia Day" },
    { day: 28, title: "Data Privacy Day" },
  ],
  "2026-02": [
    { day: 1, title: "National Freedom Day" },
    { day: 2, title: "World Wetlands Day" },
    { day: 7, title: "National Send a Card to a Friend Day" },
    { day: 10, title: "National Umbrella Day" },
    { day: 14, title: "Valentine's Day" },
    { day: 17, title: "National Random Acts of Kindness Day" },
    { day: 20, title: "World Day of Social Justice" },
    { day: 22, title: "National Margarita Day" },
    { day: 27, title: "National Strawberry Day" },
  ],
  "2026-03": [
    { day: 1, title: "National Self-Injury Awareness Day" },
    { day: 3, title: "National Employee Appreciation Day" },
    { day: 8, title: "International Women's Day" },
    { day: 10, title: "International Day of Awesomeness" },
    { day: 14, title: "Pi Day" },
    { day: 17, title: "St. Patrick's Day" },
    { day: 20, title: "International Day of Happiness" },
    { day: 21, title: "World Poetry Day" },
    { day: 22, title: "World Water Day" },
    { day: 27, title: "World Theatre Day" },
  ],
  "2026-04": [
    { day: 1, title: "April Fools' Day" },
    { day: 5, title: "Easter Sunday" },
    { day: 7, title: "World Health Day" },
    { day: 11, title: "National Pet Day" },
    { day: 15, title: "Tax Day" },
    { day: 18, title: "National Freedom Day" },
    { day: 20, title: "National Chinese Language Day" },
    { day: 22, title: "Earth Day" },
    { day: 23, title: "World Book Day" },
    { day: 25, title: "World Penguin Day" },
  ],
  "2026-05": [
    { day: 1, title: "International Workers' Day" },
    { day: 4, title: "Star Wars Day" },
    { day: 5, title: "Cinco de Mayo" },
    { day: 8, title: "World Red Cross Day" },
    { day: 10, title: "Mother's Day" },
    { day: 12, title: "International Nurses Day" },
    { day: 15, title: "International Day of Families" },
    { day: 20, title: "World Bee Day" },
    { day: 21, title: "World Day for Cultural Diversity" },
    { day: 25, title: "National Towel Day" },
    { day: 31, title: "World No Tobacco Day" },
  ],
  "2026-06": [
    { day: 1, title: "Global Day of Parents" },
    { day: 5, title: "World Environment Day" },
    { day: 8, title: "World Oceans Day" },
    { day: 12, title: "World Day Against Child Labour" },
    { day: 14, title: "World Blood Donor Day" },
    { day: 16, title: "Father's Day" },
    { day: 17, title: "World Day to Combat Desertification" },
    { day: 20, title: "World Refugee Day" },
    { day: 21, title: "International Day of Yoga" },
    { day: 26, title: "International Day Against Drug Abuse" },
  ],
  "2026-07": [
    { day: 1, title: "Canada Day" },
    { day: 4, title: "Independence Day (US)" },
    { day: 7, title: "World Chocolate Day" },
    { day: 11, title: "World Population Day" },
    { day: 14, title: "Bastille Day" },
    { day: 18, title: "Nelson Mandela Day" },
    { day: 20, title: "Moon Day" },
    { day: 24, title: "International Selfie Day" },
    { day: 28, title: "World Hepatitis Day" },
    { day: 30, title: "International Day of Friendship" },
  ],
  "2026-08": [
    { day: 1, title: "Back to School" },
    { day: 4, title: "National Sister's Day" },
    { day: 8, title: "International Cat Day" },
    { day: 9, title: "National Book Lovers Day" },
    { day: 10, title: "World Lion Day" },
    { day: 12, title: "International Youth Day" },
    { day: 13, title: "International Left-Handers Day" },
    { day: 15, title: "National Relaxation Day" },
    { day: 19, title: "World Humanitarian Day" },
    { day: 22, title: "World Plant Milk Day" },
    { day: 26, title: "National Dog Day" },
    { day: 27, title: "World River Day" },
    { day: 30, title: "National Beach Day" },
  ],
  "2026-09": [
    { day: 1, title: "World Book Day" },
    { day: 5, title: "International Day of Charity" },
    { day: 8, title: "International Literacy Day" },
    { day: 10, title: "World Suicide Prevention Day" },
    { day: 15, title: "International Day of Democracy" },
    { day: 16, title: "World Ozone Day" },
    { day: 21, title: "International Day of Peace" },
    { day: 22, title: "World Car Free Day" },
    { day: 27, title: "World Tourism Day" },
    { day: 28, title: "World Rabies Day" },
  ],
  "2026-10": [
    { day: 1, title: "International Day of Older Persons" },
    { day: 4, title: "World Animal Day" },
    { day: 5, title: "World Teachers' Day" },
    { day: 9, title: "World Post Day" },
    { day: 10, title: "World Mental Health Day" },
    { day: 15, title: "Global Handwashing Day" },
    { day: 16, title: "World Food Day" },
    { day: 24, title: "United Nations Day" },
    { day: 29, title: "World Stroke Day" },
    { day: 31, title: "Halloween" },
  ],
  "2026-11": [
    { day: 1, title: "World Vegan Day" },
    { day: 6, title: "International Day for Preventing Exploitation of Environment in War" },
    { day: 10, title: "World Science Day for Peace" },
    { day: 13, title: "World Kindness Day" },
    { day: 16, title: "International Day for Tolerance" },
    { day: 19, title: "World Toilet Day" },
    { day: 20, title: "Universal Children's Day" },
    { day: 21, title: "World Television Day" },
    { day: 25, title: "International Day for the Elimination of Violence Against Women" },
    { day: 26, title: "Thanksgiving (US)" },
  ],
  "2026-12": [
    { day: 1, title: "World AIDS Day" },
    { day: 3, title: "International Day of Persons with Disabilities" },
    { day: 5, title: "International Volunteer Day" },
    { day: 7, title: "International Civil Aviation Day" },
    { day: 10, title: "Human Rights Day" },
    { day: 18, title: "International Migrants Day" },
    { day: 20, title: "International Human Solidarity Day" },
    { day: 25, title: "Christmas Day" },
    { day: 31, title: "New Year's Eve" },
  ],
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function EventsPage() {
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed)
  const [currentYear] = useState(2026);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const events = EVENTS[monthKey] || [];

  const prevMonth = () => setCurrentMonth(m => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setCurrentMonth(m => (m === 11 ? 0 : m + 1));

  const hasEvent = (day: number) => events.some(e => e.day === day);
  const getEvent = (day: number) => events.find(e => e.day === day);

  return (
    <ToolLayout>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-bg px-6 py-4 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-medium text-text-secondary">
            <Calendar className="h-3 w-3" /> Plan your content
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Event Calendar {currentYear}</h1>
          <p className="mt-1 text-sm text-text-muted">Discover important events, holidays, and celebrations to plan your content strategy.</p>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar */}
          <div className="flex flex-1 flex-col items-center overflow-y-auto p-6">
            {/* Month Navigation */}
            <div className="mb-4 flex items-center gap-4">
              <button onClick={prevMonth} className="rounded-lg p-2 text-text-muted hover:bg-accent/10 hover:text-accent transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="min-w-[160px] text-center text-lg font-bold text-text-primary">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="rounded-lg p-2 text-text-muted hover:bg-accent/10 hover:text-accent transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid w-full max-w-[560px] grid-cols-7 gap-1 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid w-full max-w-[560px] grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const event = getEvent(day);
                const today = new Date();
                const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                return (
                  <div key={day}
                    className={`relative flex h-14 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                      event
                        ? "border-accent/30 bg-accent/5 text-accent cursor-pointer hover:bg-accent/10"
                        : isToday
                          ? "border-accent bg-accent/10 text-accent font-bold"
                          : "border-border bg-surface text-text-secondary hover:border-text-muted"
                    }`}>
                    {day}
                    {event && (
                      <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Month Bar */}
            <div className="mt-6 flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
              {MONTH_NAMES.map((m, i) => (
                <button key={m} onClick={() => setCurrentMonth(i)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    i === currentMonth
                      ? "bg-accent text-white shadow-md"
                      : "text-text-muted hover:text-text-primary hover:bg-accent/5"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Events List */}
          <div className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-border bg-bg-secondary p-5 lg:block">
            <div className="mb-1 text-lg font-bold text-text-primary">
              {MONTH_NAMES[currentMonth]} Events
            </div>
            <p className="mb-4 text-xs text-text-muted">{events.length} events this month</p>

            <div className="space-y-2">
              {events.map((event, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-accent/30 hover:shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10">
                    <span className="text-[10px] font-bold leading-none text-accent">{event.day}</span>
                    <span className="text-[8px] font-bold uppercase leading-none text-accent/70">{MONTH_NAMES[currentMonth]}</span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">{event.title}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div className="py-10 text-center text-sm text-text-muted">No events this month.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
