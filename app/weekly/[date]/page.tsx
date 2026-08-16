import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getWeeklyAdditions, installCommand, type Addition } from "@/lib/homebrew";
import { absoluteUrl, formatIssueDate, formatIssueRange, isPublishedIssueDate, parseIssueDate } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ date: string }> };

function formulaeUrl(addition: Addition) {
  return `https://formulae.brew.sh/${addition.kind}/${encodeURIComponent(addition.name)}`;
}

function safeHomepage(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function requireIssueDate(value: string) {
  if (!isPublishedIssueDate(value)) notFound();
  const date = parseIssueDate(value);
  if (!date) notFound();
  return date;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  requireIssueDate(date);
  const range = formatIssueRange(date);
  const title = `New Homebrew Packages: ${range}`;
  const description = `New Homebrew formulae and casks accepted ${range}, with descriptions, source links, and install commands.`;
  return {
    title,
    description,
    alternates: { canonical: `/weekly/${date}` },
    openGraph: { title, description, url: `/weekly/${date}`, type: "article" },
    twitter: { title, description },
  };
}

export default async function WeeklyIssuePage({ params }: Props) {
  const { date } = await params;
  const issueDate = requireIssueDate(date);
  const additions = await getWeeklyAdditions(issueDate);
  const formulaeCount = additions.filter((addition) => addition.kind === "formula").length;
  const casksCount = additions.length - formulaeCount;
  const range = formatIssueRange(date);
  const issueUrl = absoluteUrl(`/weekly/${date}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `New Homebrew packages: ${range}`,
    description: `New Homebrew formulae and casks accepted ${range}.`,
    url: issueUrl,
    datePublished: date,
    isPartOf: { "@type": "WebSite", name: "Brewlert", url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: additions.length,
      itemListElement: additions.map((addition, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: addition.displayName,
        url: formulaeUrl(addition),
      })),
    },
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="page-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/archive">Archive</Link><span>/</span><span>{date}</span></nav>
        <h1>New Homebrew packages</h1>
        <p>{range}. A permanent record of the formulae and casks added during this weekly window.</p>
        <div className="issue-stats" aria-label="Issue summary">
          <span><strong>{additions.length}</strong> additions</span>
          <span><strong>{formulaeCount}</strong> formulae</span>
          <span><strong>{casksCount}</strong> casks</span>
          <time dateTime={date}>Published {formatIssueDate(date)}</time>
        </div>
      </section>
      <section className="content-page shell" aria-labelledby="package-heading">
        <div className="content-heading">
          <h2 id="package-heading">This week’s additions</h2>
          <Link href="/#subscribe">Get future issues by email →</Link>
        </div>
        <div className="package-list">
          {additions.map((addition) => {
            const homepage = safeHomepage(addition.homepage);
            return (
              <article className="package-entry" key={`${addition.kind}-${addition.name}`}>
                <div className="package-type">{addition.kind === "formula" ? "Formula" : "Cask"}</div>
                <div className="package-copy">
                  <h3>{addition.displayName}{addition.version ? <span>{addition.version}</span> : null}</h3>
                  <p>{addition.description}</p>
                  <code>{installCommand(addition)}</code>
                </div>
                <div className="package-links">
                  <a href={formulaeUrl(addition)} target="_blank" rel="noreferrer">Homebrew page ↗</a>
                  <a href={addition.prUrl} target="_blank" rel="noreferrer">Merged PR ↗</a>
                  {homepage ? <a href={homepage} target="_blank" rel="noreferrer">Homepage ↗</a> : null}
                </div>
              </article>
            );
          })}
          {additions.length === 0 ? <p className="empty-issue">No new formulae or casks matched this weekly window.</p> : null}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
