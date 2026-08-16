import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brewlert — The week in Homebrew, delivered",
  description: "A clean Sunday digest of newly added Homebrew formulae and casks.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Brewlert",
    description: "New Homebrew formulae and casks. One clean digest every Sunday.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <SpeedInsights />
      <GoogleAnalytics gaId="G-JLQCKDH98X" />
    </html>
  );
}
