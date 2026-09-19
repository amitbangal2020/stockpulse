import { type Locale } from "./locales";

/**
 * UI copy for the app shell and the How It Works page.
 *
 * English is the source of truth: `Messages` is derived from it, so every other
 * language is checked against the same shape at compile time. Forget a key (or
 * misspell one) and `npm run build` fails instead of rendering a blank label.
 *
 * Not here on purpose: tool output (generated titles, keywords, prompts) — that
 * stays English, because it is content for the stock platforms, not UI.
 */
const en = {
  nav: {
    menu: "Menu",
    allTools: "All Tools",
    blog: "Blog",
    howItWorks: "How it Works",
    getExtension: "Get Extension",
    chromeStore: "Chrome Web Store",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    quickGenerate: "Generate",
    quickTracker: "Tracker",
    quickTools: "Tools",
    quickGuides: "Guides",
  },
  language: {
    label: "Language",
    change: "Change language",
  },
  drawer: {
    open: "Settings",
    close: "Close",
    openAria: "Open settings",
    closeAria: "Close settings",
  },
  blog: {
    title: "Blog",
    subtitle: "Microstock tips, AI workflows & keyword strategy",
    allPosts: "All Posts",
    comingSoon: "Coming Soon",
    comingSoonBody: "Guides on AI metadata, keyword research and microstock strategy are on the way.",
    keepReading: "Keep Reading",
    bengaliAll: "Read these guides in Bengali",
    bengaliThis: "Read this guide in Bengali",
  },
  howItWorks: {
    title: "How It Works",
    subtitle: "Every tool & feature, step by step — {count} tools documented",
    features: "Features ({count})",
    howToUse: "How to use",
    output: "Output",
    tips: "Tips",
    openTool: "Open {name}",
    categories: {
      all: "All",
      main: "Main",
      creative: "Creative",
      analytics: "Analytics",
      utility: "Utility",
    },
  },
};

export type Messages = typeof en;

const bn: Messages = {
  nav: {
    menu: "মেনু",
    allTools: "সব টুল",
    blog: "ব্লগ",
    howItWorks: "কীভাবে কাজ করে",
    getExtension: "এক্সটেনশন নিন",
    chromeStore: "Chrome Web Store",
    darkMode: "ডার্ক মোড",
    lightMode: "লাইট মোড",
    quickGenerate: "জেনারেট",
    quickTracker: "ট্র্যাকার",
    quickTools: "টুল",
    quickGuides: "গাইড",
  },
  language: {
    label: "ভাষা",
    change: "ভাষা বদলান",
  },
  drawer: {
    open: "সেটিংস",
    close: "বন্ধ",
    openAria: "সেটিংস খুলুন",
    closeAria: "সেটিংস বন্ধ করুন",
  },
  blog: {
    title: "ব্লগ",
    subtitle: "মাইক্রোস্টক টিপস, AI ওয়ার্কফ্লো ও কীওয়ার্ড স্ট্র্যাটেজি",
    allPosts: "সব পোস্ট",
    comingSoon: "শীঘ্রই আসছে",
    comingSoonBody: "AI মেটাডেটা, কীওয়ার্ড রিসার্চ আর মাইক্রোস্টক স্ট্র্যাটেজির গাইড আসছে।",
    keepReading: "আরও পড়ুন",
    bengaliAll: "বাংলায় লেখা সব গাইড",
    bengaliThis: "বাংলা ভাষায় এই গাইডটা পড়ুন",
  },
  howItWorks: {
    title: "কীভাবে কাজ করে",
    subtitle: "প্রতিটা টুল ও ফিচার, ধাপে ধাপে — {count}টা টুলের ডকুমেন্টেশন",
    features: "ফিচার ({count})",
    howToUse: "কীভাবে ব্যবহার করবেন",
    output: "আউটপুট",
    tips: "টিপস",
    openTool: "{name} খুলুন",
    categories: {
      all: "সব",
      main: "মূল",
      creative: "ক্রিয়েটিভ",
      analytics: "অ্যানালিটিক্স",
      utility: "ইউটিলিটি",
    },
  },
};

export const messages: Record<Locale, Messages> = { en, bn };

/** Fill `{placeholders}` in a dictionary string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] === undefined ? match : String(values[key]),
  );
}
