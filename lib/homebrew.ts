export type AdditionKind = "formula" | "cask";

export type Addition = {
  name: string;
  displayName: string;
  version: string | null;
  description: string;
  homepage: string | null;
  prUrl: string;
  mergedAt: string;
  kind: AdditionKind;
};

type GitHubSearchItem = {
  title: string;
  html_url: string;
  closed_at: string;
};

type GitHubSearchResponse = { items: GitHubSearchItem[] };

const FALLBACK_ADDITIONS: Addition[] = [
  {
    name: "vi-sql",
    displayName: "vi-sql",
    version: "0.2.0",
    description: "Query and explore data from the terminal",
    homepage: null,
    prUrl: "https://github.com/Homebrew/homebrew-core/pull/298371",
    mergedAt: "2026-08-12T14:06:43Z",
    kind: "formula",
  },
  {
    name: "systemd-lsp",
    displayName: "systemd-lsp",
    version: "2026.08.03",
    description: "Language server for systemd unit files",
    homepage: null,
    prUrl: "https://github.com/Homebrew/homebrew-core/pull/298416",
    mergedAt: "2026-08-12T13:54:53Z",
    kind: "formula",
  },
  {
    name: "muse-code",
    displayName: "muse-code",
    version: "0.1.0-R708.1",
    description: "A newly available macOS application",
    homepage: null,
    prUrl: "https://github.com/Homebrew/homebrew-cask/pull/279376",
    mergedAt: "2026-08-12T13:45:17Z",
    kind: "cask",
  },
  {
    name: "sentry-cli",
    displayName: "sentry-cli",
    version: "3.6.2",
    description: "Command-line utility for Sentry",
    homepage: null,
    prUrl: "https://github.com/Homebrew/homebrew-cask/pull/280374",
    mergedAt: "2026-08-12T12:27:12Z",
    kind: "cask",
  },
];

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "brewlert.com",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getWeeklyRange(now = new Date()) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const daysSinceSunday = end.getUTCDay();
  end.setUTCDate(end.getUTCDate() - daysSinceSunday);
  if (daysSinceSunday === 0 && now.getUTCHours() < 6) end.setUTCDate(end.getUTCDate() - 7);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 7);
  const lastIncluded = new Date(end);
  lastIncluded.setUTCDate(lastIncluded.getUTCDate() - 1);
  return { start, end, queryStart: isoDate(start), queryEnd: isoDate(lastIncluded) };
}

function parseTitle(title: string, kind: AdditionKind) {
  const cleaned = title.replace(/\s*\(new (formula|cask)\)\s*$/i, "").trim();
  const [rawName = cleaned, rawVersion] = cleaned.split(/\s+/, 2);
  return {
    name: rawName.toLowerCase(),
    displayName: rawName,
    version: rawVersion ?? null,
    kind,
  };
}

async function searchGitHub(kind: AdditionKind, start: string, end: string) {
  const repo = kind === "formula" ? "Homebrew/homebrew-core" : "Homebrew/homebrew-cask";
  const label = kind === "formula" ? "new formula" : "new cask";
  const query = `repo:${repo} is:pr is:merged label:\"${label}\" merged:${start}..${end}`;
  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "created");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "100");

  const response = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`GitHub search failed (${response.status})`);
  return (await response.json() as GitHubSearchResponse).items;
}

async function enrich(item: GitHubSearchItem, kind: AdditionKind): Promise<Addition> {
  const parsed = parseTitle(item.title, kind);
  const endpoint = `https://formulae.brew.sh/api/${kind}/${encodeURIComponent(parsed.name)}.json`;
  let description = `New Homebrew ${kind}`;
  let homepage: string | null = null;
  let displayName = parsed.displayName;
  let version = parsed.version;

  try {
    const response = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (response.ok) {
      const metadata = await response.json() as Record<string, unknown>;
      description = typeof metadata.desc === "string" && metadata.desc ? metadata.desc : description;
      homepage = typeof metadata.homepage === "string" ? metadata.homepage : null;
      if (kind === "cask" && Array.isArray(metadata.name) && typeof metadata.name[0] === "string") {
        displayName = metadata.name[0];
      }
      if (!version) {
        if (kind === "cask" && typeof metadata.version === "string") version = metadata.version;
        if (kind === "formula" && metadata.versions && typeof metadata.versions === "object") {
          const stable = (metadata.versions as Record<string, unknown>).stable;
          if (typeof stable === "string") version = stable;
        }
      }
    }
  } catch {
    // The GitHub result remains useful if metadata enrichment is temporarily unavailable.
  }

  return {
    ...parsed,
    displayName,
    version,
    description,
    homepage,
    prUrl: item.html_url,
    mergedAt: item.closed_at,
  };
}

export async function getWeeklyAdditions(now = new Date()): Promise<Addition[]> {
  const { queryStart, queryEnd } = getWeeklyRange(now);
  const [formulae, casks] = await Promise.all([
    searchGitHub("formula", queryStart, queryEnd),
    searchGitHub("cask", queryStart, queryEnd),
  ]);
  const additions = await Promise.all([
    ...formulae.map((item) => enrich(item, "formula")),
    ...casks.map((item) => enrich(item, "cask")),
  ]);
  return additions.sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
}

export async function getLatestAdditions(): Promise<Addition[]> {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - 14);
    const [formulae, casks] = await Promise.all([
      searchGitHub("formula", isoDate(start), isoDate(now)),
      searchGitHub("cask", isoDate(start), isoDate(now)),
    ]);
    const latest = [...formulae.slice(0, 3).map((item) => ({ item, kind: "formula" as const })),
      ...casks.slice(0, 3).map((item) => ({ item, kind: "cask" as const }))]
      .sort((a, b) => b.item.closed_at.localeCompare(a.item.closed_at))
      .slice(0, 4);
    return await Promise.all(latest.map(({ item, kind }) => enrich(item, kind)));
  } catch {
    return FALLBACK_ADDITIONS;
  }
}

export function installCommand(addition: Addition) {
  return addition.kind === "cask"
    ? `brew install --cask ${addition.name}`
    : `brew install ${addition.name}`;
}
