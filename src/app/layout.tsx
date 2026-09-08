import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
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
  title: "StockPulse — AI Metadata & Analytics for Microstock",
  description:
    "Generate optimized titles, descriptions, keywords, and creative prompts for Adobe Stock, Shutterstock, Freepik, Vecteezy, Pond5, and iStock.",
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
  ],
  authors: [{ name: "StockPulse" }],
  openGraph: {
    title: "StockPulse — AI Metadata & Analytics for Microstock",
    description:
      "Generate optimized metadata for all major microstock platforms with AI-powered tools.",
    type: "website",
    siteName: "StockPulse",
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
        <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
