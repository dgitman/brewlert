import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About and Methodology",
  description: "Learn why Brewlert exists, how it identifies new Homebrew packages, which public sources it uses, and where its limits are.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Brewlert",
    description: "How Brewlert identifies and publishes newly added Homebrew formulae and casks.",
    url: "/about",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Brewlert",
    description: metadata.description,
    url: absoluteUrl("/about"),
    mainEntity: {
      "@type": "WebSite",
      name: "Brewlert",
      url: absoluteUrl("/"),
      description: "A free weekly newsletter of newly added Homebrew formulae and casks.",
    },
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <SiteHeader />
      <section className="page-hero shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>About</span></nav>
        <h1>About Brewlert</h1>
        <p>A small, independent publication for people who want to discover what is newly available through Homebrew without following two busy repositories.</p>
      </section>
      <div className="prose-page shell">
        <section className="prose-section">
          <h2>Why it exists</h2>
          <p>Homebrew’s contribution process is public and detailed, but new formulae and casks arrive among many maintenance updates. Brewlert turns the accepted additions into one readable Sunday issue with the context needed to decide what deserves a closer look.</p>
        </section>
        <section className="prose-section">
          <h2>How packages are selected</h2>
          <p>Brewlert searches merged pull requests labeled <code>new formula</code> in <a href="https://github.com/Homebrew/homebrew-core" target="_blank" rel="noreferrer">Homebrew/homebrew-core ↗</a> and <code>new cask</code> in <a href="https://github.com/Homebrew/homebrew-cask" target="_blank" rel="noreferrer">Homebrew/homebrew-cask ↗</a>. Each issue covers the previous Sunday through Saturday in UTC.</p>
          <p>The package definition committed by the accepted pull request supplies the preferred description and homepage. Brewlert also uses the <a href="https://formulae.brew.sh/docs/api/" target="_blank" rel="noreferrer">Homebrew Formulae JSON API ↗</a> for display names, versions, and fallback metadata.</p>
        </section>
        <section className="prose-section">
          <h2>What each entry preserves</h2>
          <ul>
            <li>The formula or cask name and package type.</li>
            <li>A short description, version when available, and install command.</li>
            <li>The upstream homepage, official Homebrew page, and merged pull request.</li>
            <li>The weekly window in which Homebrew accepted the addition.</li>
          </ul>
        </section>
        <section className="prose-section">
          <h2>Limits and independence</h2>
          <p>Brewlert reports Homebrew additions; it does not independently certify each upstream project or package. Readers should review the linked homepage, package metadata, and source pull request before installing unfamiliar software.</p>
          <p>Brewlert is an independent project and is not affiliated with or endorsed by Homebrew. Homebrew names, repository data, and package metadata remain attributable to their respective sources.</p>
        </section>
        <section className="prose-section">
          <h2>Open source</h2>
          <p>The collection and publishing code is available in the <a href="https://github.com/dgitman/brewlert" target="_blank" rel="noreferrer">Brewlert GitHub repository ↗</a>. For a step-by-step explanation, read <Link href="/guides/how-brewlert-works">How Brewlert Finds New Formulae and Casks</Link>.</p>
        </section>
        <nav className="article-next" aria-label="More Brewlert content">
          <Link href="/guides">Read the guides →</Link>
          <Link href="/archive">Browse weekly issues →</Link>
        </nav>
      </div>
      <SiteFooter />
    </main>
  );
}
