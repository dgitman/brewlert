import { digestHtml } from "@/lib/digest";
import { getWeeklyAdditions, getWeeklyRange } from "@/lib/homebrew";
import { getResend, getSegmentIds } from "@/lib/resend";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const range = getWeeklyRange(now);
    const additions = await getWeeklyAdditions(now);
    const formulae = additions.filter((addition) => addition.kind === "formula");
    const casks = additions.filter((addition) => addition.kind === "cask");
    const segments = getSegmentIds();
    const from = process.env.RESEND_FROM;
    if (!from) throw new Error("RESEND_FROM is not configured");
    const resend = getResend();

    const deliveries = [
      { name: "formulae", segmentId: segments.formulae, additions: formulae },
      { name: "casks", segmentId: segments.casks, additions: casks },
      { name: "both", segmentId: segments.both, additions },
    ];

    const results = await Promise.all(deliveries.map(async (delivery) => {
      const result = await resend.broadcasts.create({
        segmentId: delivery.segmentId,
        from,
        name: `Brewlert ${range.queryStart} ${delivery.name}`,
        subject: `${delivery.additions.length} fresh Homebrew additions this week`,
        html: digestHtml(delivery.additions, range.start, range.end),
        send: true,
      });
      if (result.error) throw new Error(result.error.message);
      return { segment: delivery.name, broadcastId: result.data?.id };
    }));

    return Response.json({ ok: true, additions: additions.length, results });
  } catch (error) {
    console.error("Digest error", error);
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
