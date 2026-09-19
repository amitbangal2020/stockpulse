import type { Locale, TranslatedLocale } from "@/lib/i18n/locales";

interface BlogChromeCopy {
  /** Page heading and its one-line subtitle. */
  title: string;
  subtitle: string;
  /** Back to the index, from a post. */
  backToAll: string;
  keepReading: string;
  comingSoon: string;
  comingSoonBody: string;
}

/**
 * Chrome for the translated blog pages.
 *
 * Plain data rather than `useLanguage()` on purpose: these pages must arrive
 * with their labels already in the right language in the *initial HTML*, and a
 * client component reading the visitor's stored preference would render English
 * on the server — the one thing this whole route-per-language setup exists to
 * avoid.
 */
export const BLOG_CHROME: Record<TranslatedLocale, BlogChromeCopy> = {
  bn: {
    title: "ব্লগ",
    subtitle: "মাইক্রোস্টক টিপস, AI ওয়ার্কফ্লো ও কীওয়ার্ড স্ট্র্যাটেজি",
    backToAll: "সব পোস্ট",
    keepReading: "আরও পড়ুন",
    comingSoon: "শীঘ্রই আসছে",
    comingSoonBody: "বাংলা গাইডগুলো লেখা হচ্ছে — ততদিন ইংরেজি পোস্টগুলো পড়তে পারেন।",
  },
  hi: {
    title: "ब्लॉग",
    subtitle: "माइक्रोस्टॉक टिप्स, AI वर्कफ़्लो और कीवर्ड रणनीति",
    backToAll: "सभी पोस्ट",
    keepReading: "आगे पढ़ें",
    comingSoon: "जल्द आ रहा है",
    comingSoonBody: "हिंदी गाइड लिखी जा रही हैं — तब तक अंग्रेज़ी पोस्ट पढ़ सकते हैं।",
  },
};

/** Index <title> / meta description per language, including English. */
export const BLOG_INDEX_SEO: Record<Locale, { title: string; description: string; ogAlt: string }> = {
  en: {
    title: "StockPulse Blog — Microstock Tips, AI Workflows & Keyword Research",
    description:
      "Practical guides for microstock sellers: AI metadata workflows, Adobe Stock keyword strategy, trend forecasting and earning more from every upload.",
    ogAlt: "StockPulse blog",
  },
  bn: {
    title: "ব্লগ — মাইক্রোস্টক টিপস, AI ওয়ার্কফ্লো ও কীওয়ার্ড রিসার্চ",
    description:
      "মাইক্রোস্টক সেলারদের জন্য বাংলা গাইড: Adobe Stock কীওয়ার্ড স্ট্র্যাটেজি, AI মেটাডেটা ওয়ার্কফ্লো, সিজনাল আপলোড টাইমিং আর AI কনটেন্টের নিয়ম।",
    ogAlt: "StockPulse বাংলা ব্লগ",
  },
  hi: {
    title: "ब्लॉग — माइक्रोस्टॉक टिप्स, AI वर्कफ़्लो और कीवर्ड रिसर्च",
    description:
      "माइक्रोस्टॉक विक्रेताओं के लिए हिंदी गाइड: Adobe Stock कीवर्ड रणनीति, AI मेटाडेटा वर्कफ़्लो, सीज़नल अपलोड टाइमिंग और AI कंटेंट के नियम।",
    ogAlt: "StockPulse हिंदी ब्लॉग",
  },
};
