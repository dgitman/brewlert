import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getGuide, GUIDES } from "@/lib/guides";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `/guides/${guide.slug}`, type: "article" },
    twitter: { title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const url = absoluteUrl(`/guides/${guide.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    datePublished: "2026-08-16",
    dateModified: "2026-08-16",
    author: { "@type": "Organization", name: "Brewlert", url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: "Brewlert", url: absoluteUrl("/") },
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <article>
        <header className="page-hero shell">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>{guide.title}</span></nav>
          <h1>{guide.title}</h1>
          <p>{guide.intro}</p>
        </header>
        <div className="prose-page shell">
          {guide.sections.map((section) => (
            <section className="prose-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              {section.command ? <pre><code>{section.command}</code></pre> : null}
            </section>
          ))}
          <section className="prose-section source-section" aria-labelledby="sources-heading">
            <h2 id="sources-heading">Official sources and further reading</h2>
            <ul>
              {guide.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}
            </ul>
          </section>
          <nav className="article-next" aria-label="More Brewlert content">
            <Link href="/guides">← All guides</Link>
            <Link href="/archive">Browse weekly issues →</Link>
          </nav>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
