import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Homebrew Guides",
  description: "Practical guides to Homebrew formulae, casks, package discovery, and Brewlert’s weekly data methodology.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Brewlert Homebrew Guides",
    description: "Practical guides to Homebrew packages, discovery, and Brewlert’s weekly methodology.",
    url: "/guides",
  },
};

export default function GuidesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brewlert Homebrew Guides",
    description: metadata.description,
    url: absoluteUrl("/guides"),
    hasPart: GUIDES.map((guide) => ({ "@type": "Article", headline: guide.title, url: absoluteUrl(`/guides/${guide.slug}`) })),
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="page-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Guides</span></nav>
        <h1>Homebrew guides</h1>
        <p>Clear explanations for finding, evaluating, and understanding Homebrew packages—grounded in official documentation and source data.</p>
      </section>
      <section className="content-page shell" aria-labelledby="guide-heading">
        <div className="content-heading">
          <h2 id="guide-heading">Start here</h2>
          <p>{GUIDES.length} practical guides</p>
        </div>
        <div className="guide-list">
          {GUIDES.map((guide, index) => (
            <Link href={`/guides/${guide.slug}`} className="guide-row" key={guide.slug}>
              <span className="guide-number">0{index + 1}</span>
              <div><h3>{guide.title}</h3><p>{guide.description}</p></div>
              <span className="text-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
