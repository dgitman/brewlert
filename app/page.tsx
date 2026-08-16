import { BrandMark } from "@/components/BrandMark";
import { SubscribeForm } from "@/components/SubscribeForm";
import { Addition, getLatestAdditions, installCommand } from "@/lib/homebrew";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageIcon({ kind }: { kind: Addition["kind"] }) {
  return kind === "formula" ? (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="m14 3 9 5v11l-9 6-9-6V8l9-5Zm0 0v11m9-6-9 6-9-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  ) : (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3 25 9l-11 6L3 9l11-6Zm-9 11 9 6 9-6M5 19l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  );
}

function AdditionRow({ addition }: { addition: Addition }) {
  return (
    <article className="email-row">
      <div className="row-icon"><PackageIcon kind={addition.kind} /></div>
      <div className="row-copy">
        <h3>{addition.displayName} <span>· {addition.description}</span></h3>
        <code>{installCommand(addition)}</code>
      </div>
      <a className="row-type" href={addition.prUrl} target="_blank" rel="noreferrer">
        {addition.kind === "formula" ? "Formula" : "Cask"}
        <PackageIcon kind={addition.kind} />
      </a>
    </article>
  );
}

export default async function Home() {
  const additions = await getLatestAdditions();
  const preview = additions.slice(0, 4);

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a href="#top" className="wordmark" aria-label="Brewlert home">
          <BrandMark />
          <span>Brewlert</span>
        </a>
        <div className="nav-links">
          <a href="#latest">Latest</a>
          <a href="#how-it-works">How it works</a>
          <a href="#subscribe" className="nav-cta">Subscribe</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <h1>The week in<span className="hero-line">Homebrew, delivered.</span></h1>
          <p>A free weekly Homebrew newsletter featuring new formulae and casks, with descriptions and install commands.</p>
          <SubscribeForm />
        </div>

        <div className="email-preview" aria-label="Preview of the weekly Brewlert email">
          <div className="email-meta">
            <span><strong>Brewlert</strong> &lt;digest@brewlert.com&gt;</span>
            <time>Sunday · 9:00</time>
          </div>
          <h2>Fresh pours · this week</h2>
          <div className="email-rows">
            {preview.map((addition) => <AdditionRow key={`${addition.kind}-${addition.name}`} addition={addition} />)}
          </div>
          <a className="github-link" href="https://github.com/Homebrew" target="_blank" rel="noreferrer">
            View the Homebrew repositories <ArrowIcon />
          </a>
        </div>
      </section>

      <section className="process shell" id="how-it-works" aria-labelledby="process-heading">
        <h2 className="sr-only" id="process-heading">How Brewlert works</h2>
        <article>
          <span className="step-icon" aria-hidden="true">⑂</span>
          <div><h3>Merged</h3><p>We scan Homebrew/core and Homebrew/cask for new additions all week.</p></div>
        </article>
        <article>
          <span className="step-icon" aria-hidden="true">▤</span>
          <div><h3>Enriched</h3><p>Each entry gets its description, version, homepage, and install command.</p></div>
        </article>
        <article>
          <span className="step-icon" aria-hidden="true">▦</span>
          <div><h3>Sent Sunday</h3><p>One readable email, matched to the categories you actually want.</p></div>
        </article>
      </section>

      <section className="latest shell" id="latest" aria-labelledby="latest-heading">
        <div className="section-heading">
          <h2 id="latest-heading">Latest additions</h2>
          <a href="https://github.com/Homebrew/homebrew-core/pulls?q=is%3Apr+is%3Amerged+label%3A%22new+formula%22" target="_blank" rel="noreferrer">View all on GitHub <ArrowIcon /></a>
        </div>
        <div className="latest-rail">
          {additions.slice(0, 4).map((addition) => (
            <article key={`latest-${addition.kind}-${addition.name}`}>
              <PackageIcon kind={addition.kind} />
              <div>
                <h3>{addition.displayName}</h3>
                <p>{addition.description}</p>
                <code>{installCommand(addition)}</code>
                <a href={addition.prUrl} target="_blank" rel="noreferrer">{addition.kind === "formula" ? "Formula" : "Cask"}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer shell">
        <p>Powered by the <a href="https://formulae.brew.sh/docs/api/" target="_blank" rel="noreferrer">Homebrew API ↗</a> <span>·</span> <a href="https://github.com/Homebrew" target="_blank" rel="noreferrer">Source on GitHub ↗</a></p>
        <p>Brewlert is an independent project and is not affiliated with Homebrew.</p>
      </footer>
    </main>
  );
}
