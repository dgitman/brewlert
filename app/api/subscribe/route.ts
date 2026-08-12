import { NextResponse } from "next/server";
import { getResend, getSegmentId, getSegmentIds, SubscriptionChoice } from "@/lib/resend";

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; formulae?: unknown; casks?: unknown };
    if (!validEmail(body.email)) return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    if (typeof body.formulae !== "boolean" || typeof body.casks !== "boolean" || (!body.formulae && !body.casks)) {
      return NextResponse.json({ message: "Choose formulae, casks, or both." }, { status: 400 });
    }

    const choice: SubscriptionChoice = body.formulae && body.casks ? "both" : body.formulae ? "formulae" : "casks";
    const target = getSegmentId(choice);
    const allSegments = Object.values(getSegmentIds());
    const resend = getResend();

    const created = await resend.contacts.create({
      email: body.email,
      unsubscribed: false,
      segments: [{ id: target }],
    });

    if (created.error) {
      const updated = await resend.contacts.update({ email: body.email, unsubscribed: false });
      if (updated.error) throw new Error(updated.error.message);
      await Promise.all(allSegments.filter((segmentId) => segmentId !== target).map(async (segmentId) => {
        await resend.contacts.segments.remove({ email: body.email as string, segmentId });
      }));
      const added = await resend.contacts.segments.add({ email: body.email, segmentId: target });
      if (added.error) throw new Error(added.error.message);
    }

    return NextResponse.json({ message: "You’re in. Your first digest arrives Sunday." });
  } catch (error) {
    console.error("Subscription error", error);
    return NextResponse.json({ message: "Subscription is not configured yet. Please try again later." }, { status: 503 });
  }
}
