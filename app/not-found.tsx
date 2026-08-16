import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero shell not-found-page">
        <h1>Page not found</h1>
        <p>The issue or guide you requested is not part of the Brewlert archive.</p>
        <div className="not-found-links"><Link href="/archive">Browse the archive</Link><Link href="/guides">Read the guides</Link></div>
      </section>
      <SiteFooter />
    </main>
  );
}
