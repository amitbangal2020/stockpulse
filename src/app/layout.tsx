import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectionProvider } from "@/components/protection-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StockPulse — AI Metadata & Analytics for Microstock",
    template: "%s | StockPulse",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  description:
    "Generate AI-optimized titles, keywords & descriptions for Adobe Stock, Shutterstock, Freepik and more. Track downloads and analyze trends — all in one place.",
  keywords: [
    "AI metadata generator",
    "Adobe Stock keywords",
    "Shutterstock titles",
    "microstock optimization",
    "image metadata",
    "stock photo keywords",
    "creative prompts",
    "AI image tools",
    "content creator tools",
    "stock portfolio tracker",
    "download analytics",
    "Freepik keywords",
    "Vecteezy SEO",
  ],
  authors: [{ name: "StockPulse" }],
  creator: "StockPulse",
  metadataBase: new URL("https://abanti.in"),
  openGraph: {
    title: "StockPulse — AI Metadata & Analytics for Microstock",
    description:
      "AI-powered metadata for Adobe Stock, Shutterstock, Freepik & more. Track downloads and analyze trends.",
    url: "https://abanti.in",
    siteName: "StockPulse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StockPulse — AI Microstock Toolkit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockPulse — AI Metadata & Analytics for Microstock",
    description:
      "AI-powered metadata for Adobe Stock, Shutterstock, Freepik & more. Track downloads and analyze trends.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://abanti.in",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden flex flex-col antialiased">
        <ThemeProvider><AuthProvider><ProtectionProvider>{children}</ProtectionProvider></AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
