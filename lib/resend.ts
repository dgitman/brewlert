import { Resend } from "resend";

let client: Resend | null = null;

export function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  client ??= new Resend(apiKey);
  return client;
}

export type SubscriptionChoice = "formulae" | "casks" | "both";

export function getSegmentIds() {
  const formulae = process.env.RESEND_SEGMENT_FORMULAE;
  const casks = process.env.RESEND_SEGMENT_CASKS;
  const both = process.env.RESEND_SEGMENT_BOTH;
  if (!formulae || !casks || !both) throw new Error("Resend segment IDs are not configured");
  return { formulae, casks, both };
}

export function getSegmentId(choice: SubscriptionChoice) {
  return getSegmentIds()[choice];
}
