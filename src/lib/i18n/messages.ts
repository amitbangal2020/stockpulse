import { type Locale } from "./locales";

/**
 * UI copy for the app shell and the How It Works page.
 *
 * English is the source of truth: `Messages` is derived from it, so every other
 * language is checked against the same shape at compile time. Forget a key (or
 * misspell one) and `npm run build` fails instead of rendering a blank label.
 *
 * Not here on purpose: tool output (generated titles, keywords, prompts) — that
 * stays English, because it is content for the stock platforms, not UI. Blog
 * *posts* are content too and live in `blog-posts*.ts`.
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
    /** Opens the list of other languages a page is available in (and, for the
     * labels inside it, the heading of that control). */
    otherLanguages: "Read in another language",
    /**
     * Labels for sending the reader to another language's version of the page
     * they are on, in the language they are reading. Every language needs an
     * entry for every target so a new one cannot ship half-labelled.
     */
    translations: {
      en: { all: "Read all the guides in English", this: "Read this guide in English" },
      bn: { all: "Read these guides in Bengali", this: "Read this guide in Bengali" },
      hi: { all: "Read these guides in Hindi", this: "Read this guide in Hindi" },
    },
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
    otherLanguages: "অন্য ভাষায় পড়ুন",
    translations: {
      en: { all: "ইংরেজিতে সব গাইড পড়ুন", this: "ইংরেজিতে এই গাইডটা পড়ুন" },
      bn: { all: "বাংলায় লেখা সব গাইড", this: "বাংলা ভাষায় এই গাইডটা পড়ুন" },
      hi: { all: "হিন্দিতে সব গাইড পড়ুন", this: "হিন্দিতে এই গাইডটা পড়ুন" },
    },
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

const hi: Messages = {
  nav: {
    menu: "मेन्यू",
    allTools: "सभी टूल",
    blog: "ब्लॉग",
    howItWorks: "यह कैसे काम करता है",
    getExtension: "एक्सटेंशन पाएं",
    chromeStore: "Chrome Web Store",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    quickGenerate: "जनरेट",
    quickTracker: "ट्रैकर",
    quickTools: "टूल",
    quickGuides: "गाइड",
  },
  language: {
    label: "भाषा",
    change: "भाषा बदलें",
  },
  drawer: {
    open: "सेटिंग्स",
    close: "बंद करें",
    openAria: "सेटिंग्स खोलें",
    closeAria: "सेटिंग्स बंद करें",
  },
  blog: {
    title: "ब्लॉग",
    subtitle: "माइक्रोस्टॉक टिप्स, AI वर्कफ़्लो और कीवर्ड रणनीति",
    allPosts: "सभी पोस्ट",
    comingSoon: "जल्द आ रहा है",
    comingSoonBody: "AI मेटाडेटा, कीवर्ड रिसर्च और माइक्रोस्टॉक रणनीति की गाइड तैयार हो रही हैं।",
    keepReading: "आगे पढ़ें",
    otherLanguages: "दूसरी भाषा में पढ़ें",
    translations: {
      en: { all: "सभी गाइड अंग्रेज़ी में पढ़ें", this: "यह गाइड अंग्रेज़ी में पढ़ें" },
      bn: { all: "सभी गाइड बांग्ला में पढ़ें", this: "यह गाइड बांग्ला में पढ़ें" },
      hi: { all: "हिंदी में सभी गाइड पढ़ें", this: "यह गाइड हिंदी में पढ़ें" },
    },
  },
  howItWorks: {
    title: "यह कैसे काम करता है",
    subtitle: "हर टूल और फ़ीचर, एक-एक कदम — {count} टूल का दस्तावेज़",
    features: "फ़ीचर ({count})",
    howToUse: "इस्तेमाल कैसे करें",
    output: "आउटपुट",
    tips: "सुझाव",
    openTool: "{name} खोलें",
    categories: {
      all: "सभी",
      main: "मुख्य",
      creative: "क्रिएटिव",
      analytics: "एनालिटिक्स",
      utility: "यूटिलिटी",
    },
  },
};

export const messages: Record<Locale, Messages> = { en, bn, hi };

/** Fill `{placeholders}` in a dictionary string. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] === undefined ? match : String(values[key]),
  );
}
