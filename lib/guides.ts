export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  command?: string;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  sources: Array<{ label: string; href: string }>;
};

export const GUIDES: Guide[] = [
  {
    slug: "homebrew-formula-vs-cask",
    title: "Homebrew Formula vs. Cask",
    description: "Understand the practical difference between Homebrew formulae and casks, including how each package type is installed.",
    intro: "Formulae and casks are both Homebrew packages, but they describe different distribution models. The distinction affects where software comes from, how Homebrew installs it, and which command you use.",
    sections: [
      {
        heading: "What is a Homebrew formula?",
        paragraphs: [
          "A formula is a package definition for software that Homebrew can build from upstream source code. In practice, formulae commonly provide command-line tools, libraries, language runtimes, and background services.",
          "Homebrew may install a pre-built bottle instead of compiling locally, but the formula still defines the source, dependencies, build steps, tests, and installation layout.",
        ],
        command: "brew install wget",
      },
      {
        heading: "What is a Homebrew cask?",
        paragraphs: [
          "A cask installs a pre-compiled binary distributed by its upstream developer. Casks commonly represent macOS applications, fonts, plugins, and vendor installers, although supported binary artifacts can also target Linux.",
          "The cask definition tells Homebrew where to download the software and which application, package, binary, or other artifact should be installed.",
        ],
        command: "brew install --cask firefox",
      },
      {
        heading: "The quickest way to choose",
        paragraphs: [
          "If you want a command-line tool or library, start by looking for a formula. If you want a desktop application or another vendor-built binary, start with casks. Homebrew’s own search covers both collections, so you do not need to know the package type before searching.",
        ],
        bullets: [
          "Formula: usually open-source software Homebrew can build from source.",
          "Cask: usually an application or pre-built binary published by the developer.",
          "Some packages are exceptions, so confirm the type with brew info before installing.",
        ],
        command: "brew info <package-name>",
      },
    ],
    sources: [
      { label: "Homebrew terminology and commands", href: "https://docs.brew.sh/Manpage" },
      { label: "Adding software to Homebrew", href: "https://docs.brew.sh/Adding-Software-to-Homebrew" },
      { label: "Homebrew Cask Cookbook", href: "https://docs.brew.sh/Cask-Cookbook" },
    ],
  },
  {
    slug: "find-new-homebrew-packages",
    title: "How to Find New Homebrew Packages",
    description: "Use Homebrew search, package metadata, official repositories, and Brewlert to discover useful new formulae and casks.",
    intro: "Homebrew contains thousands of packages, but the newest additions can be difficult to notice. These methods help you search deliberately, inspect a package before installing it, and keep up with newly merged software.",
    sections: [
      {
        heading: "Search formulae and casks together",
        paragraphs: [
          "The brew search command performs a substring search across formula names and cask tokens. Search is extended online to Homebrew’s core and cask repositories, so it is the fastest starting point when you know part of a package’s name.",
        ],
        command: "brew search <text>",
      },
      {
        heading: "Inspect a package before installing",
        paragraphs: [
          "Use brew info to see a package’s description, version, homepage, dependencies, installation status, and other available metadata. This is especially useful when similarly named formulae and casks appear in search results.",
        ],
        command: "brew info <package-name>",
      },
      {
        heading: "Browse the official catalog",
        paragraphs: [
          "The Homebrew Formulae site provides browsable formula and cask pages backed by Homebrew’s documented JSON API. Package pages include install commands and current metadata without requiring a local Homebrew installation.",
        ],
        bullets: [
          "Browse formulae for command-line tools, libraries, runtimes, and services.",
          "Browse casks for applications, fonts, plugins, and other pre-built software.",
          "Follow the package homepage when you need release notes or upstream documentation.",
        ],
      },
      {
        heading: "Watch newly merged additions",
        paragraphs: [
          "New packages enter Homebrew through reviewed pull requests in homebrew/core and homebrew/cask. Brewlert follows the merged pull requests labeled new formula and new cask, enriches them with package metadata, and collects them into one Sunday issue.",
          "The weekly archive gives each issue a permanent URL, so you can revisit a particular week instead of relying on a constantly changing package list.",
        ],
      },
    ],
    sources: [
      { label: "Homebrew command reference", href: "https://docs.brew.sh/Manpage" },
      { label: "Querying brew", href: "https://docs.brew.sh/Querying-Brew" },
      { label: "Homebrew Formulae catalog", href: "https://formulae.brew.sh/" },
    ],
  },
  {
    slug: "how-brewlert-works",
    title: "How Brewlert Finds New Formulae and Casks",
    description: "Learn how Brewlert identifies, verifies, enriches, and publishes newly added Homebrew packages each week.",
    intro: "Brewlert is built around Homebrew’s public contribution trail. It does not guess which packages are new: it follows reviewed pull requests, preserves their source links, and enriches each accepted addition with official package metadata.",
    sections: [
      {
        heading: "1. Find merged additions",
        paragraphs: [
          "Brewlert searches Homebrew/homebrew-core for merged pull requests labeled new formula and Homebrew/homebrew-cask for merged pull requests labeled new cask. Each result retains the original pull-request URL and merge timestamp.",
        ],
      },
      {
        heading: "2. Use a fixed weekly window",
        paragraphs: [
          "Every issue covers the previous Sunday through Saturday in UTC. A fixed boundary keeps the email, archive page, and source queries aligned and prevents an addition from drifting between issues.",
        ],
      },
      {
        heading: "3. Enrich from committed and official data",
        paragraphs: [
          "Brewlert first reads the package description and homepage from the definition committed by the accepted pull request. It also queries the matching Homebrew Formulae JSON endpoint for the display name, version, and fallback metadata.",
          "This approach keeps the entry tied to the reviewed contribution while using Homebrew’s public API to fill in useful display details.",
        ],
      },
      {
        heading: "4. Publish useful installation context",
        paragraphs: [
          "Each entry includes its package type, description, version when available, upstream homepage, Homebrew page, source pull request, and the appropriate install command. Subscribers can choose formulae, casks, or both.",
        ],
        bullets: [
          "Formula install command: brew install <name>",
          "Cask install command: brew install --cask <name>",
          "Source links remain available for independent verification.",
        ],
      },
      {
        heading: "Limits and attribution",
        paragraphs: [
          "Brewlert reports packages accepted into Homebrew during the weekly window. It does not independently audit each upstream project, certify package security, or represent Homebrew. Package descriptions and metadata remain attributable to their linked upstream and Homebrew sources.",
        ],
      },
    ],
    sources: [
      { label: "Homebrew/core pull requests", href: "https://github.com/Homebrew/homebrew-core/pulls" },
      { label: "Homebrew/cask pull requests", href: "https://github.com/Homebrew/homebrew-cask/pulls" },
      { label: "Homebrew Formulae JSON API", href: "https://formulae.brew.sh/docs/api/" },
      { label: "Brewlert source code", href: "https://github.com/dgitman/brewlert" },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}
