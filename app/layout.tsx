import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://brewlert.com"),
  title: "Brewlert — New Homebrew Formulae & Casks Weekly",
  description: "A free weekly Homebrew newsletter featuring new formulae and casks, with descriptions and install commands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Brewlert — New Homebrew Formulae & Casks Weekly",
    description: "Discover newly added Homebrew formulae and casks in one clean newsletter every Sunday.",
    url: "/",
    siteName: "Brewlert",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brewlert — New Homebrew Formulae & Casks Weekly",
    description: "Discover newly added Homebrew formulae and casks in one clean newsletter every Sunday.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
      <GoogleAnalytics gaId="G-JLQCKDH98X" />
    </html>
  );
}
