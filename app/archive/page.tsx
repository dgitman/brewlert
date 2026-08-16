import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { absoluteUrl, formatIssueDate, formatIssueRange, listIssueDates } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Weekly Homebrew Archive",
  description: "Browse permanent weekly issues of newly added Homebrew formulae and casks, with descriptions, source links, and install commands.",
  alternates: { canonical: "/archive" },
  openGraph: {
    title: "Brewlert Weekly Homebrew Archive",
    description: "Browse permanent weekly issues of newly added Homebrew formulae and casks.",
    url: "/archive",
  },
};

export default function ArchivePage() {
  const issueDates = listIssueDates();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brewlert Weekly Homebrew Archive",
    description: metadata.description,
    url: absoluteUrl("/archive"),
    hasPart: issueDates.map((date) => ({
      "@type": "CollectionPage",
      name: `New Homebrew packages: ${formatIssueRange(date)}`,
      url: absoluteUrl(`/weekly/${date}`),
    })),
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="page-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Archive</span></nav>
        <h1>Weekly Homebrew archive</h1>
        <p>Permanent Sunday issues of newly added Homebrew formulae and casks, with the source and install context preserved.</p>
      </section>
      <section className="content-page shell" aria-labelledby="issues-heading">
        <div className="content-heading">
          <h2 id="issues-heading">All issues</h2>
          <p>{issueDates.length} {issueDates.length === 1 ? "issue" : "issues"} published</p>
        </div>
        <div className="issue-list">
          {issueDates.map((date, index) => (
            <Link href={`/weekly/${date}`} className="issue-row" key={date}>
              <div>
                <span className="issue-number">Issue {issueDates.length - index}</span>
                <h3>{formatIssueRange(date)}</h3>
                <p>New formulae and casks accepted during this weekly window.</p>
              </div>
              <time dateTime={date}>{formatIssueDate(date)}</time>
              <span className="text-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
