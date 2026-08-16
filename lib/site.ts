import { getWeeklyRange } from "@/lib/homebrew";

export const SITE_URL = "https://brewlert.com";
export const FIRST_ISSUE_DATE = "2026-08-16";

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function parseIssueDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || isoDate(date) !== value || date.getUTCDay() !== 0) return null;
  return date;
}

export function currentIssueDate(now = new Date()) {
  return isoDate(getWeeklyRange(now).end);
}

export function isPublishedIssueDate(value: string, now = new Date()) {
  const date = parseIssueDate(value);
  if (!date) return false;
  return value >= FIRST_ISSUE_DATE && value <= currentIssueDate(now);
}

export function listIssueDates(now = new Date()) {
  const first = parseIssueDate(FIRST_ISSUE_DATE);
  const current = parseIssueDate(currentIssueDate(now));
  if (!first || !current || current < first) return [];

  const dates: string[] = [];
  for (const date = new Date(current); date >= first; date.setUTCDate(date.getUTCDate() - 7)) {
    dates.push(isoDate(date));
  }
  return dates;
}

export function issueRange(value: string) {
  const issueDate = parseIssueDate(value);
  if (!issueDate) throw new Error(`Invalid Brewlert issue date: ${value}`);
  const start = new Date(issueDate);
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(issueDate);
  end.setUTCDate(end.getUTCDate() - 1);
  return { start, end };
}

export function formatIssueDate(value: string) {
  const date = parseIssueDate(value);
  if (!date) return value;
  return longDate.format(date);
}

export function formatIssueRange(value: string) {
  const { start, end } = issueRange(value);
  return `${shortDate.format(start)}–${shortDate.format(end)}, ${end.getUTCFullYear()}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
