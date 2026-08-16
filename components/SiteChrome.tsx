import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function SiteHeader() {
  return (
    <nav className="nav shell" aria-label="Main navigation">
      <Link href="/" className="wordmark" aria-label="Brewlert home">
        <BrandMark />
        <span>Brewlert</span>
      </Link>
      <div className="nav-links">
        <Link href="/archive">Archive</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/about">About</Link>
        <Link href="/#subscribe" className="nav-cta">Subscribe</Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer shell">
      <p>
        Powered by the <a href="https://formulae.brew.sh/docs/api/" target="_blank" rel="noreferrer">Homebrew API ↗</a>
        <span>·</span>
        <a href="https://github.com/dgitman/brewlert" target="_blank" rel="noreferrer">Brewlert source ↗</a>
      </p>
      <p className="footer-links">
        <Link href="/archive">Archive</Link>
        <span>·</span>
        <Link href="/guides">Guides</Link>
        <span>·</span>
        <Link href="/about">About</Link>
      </p>
      <p>Brewlert is an independent project and is not affiliated with Homebrew.</p>
    </footer>
  );
}
