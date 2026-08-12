import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("Set RESEND_API_KEY before running npm run setup:resend");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const definitions = [
  ["RESEND_SEGMENT_FORMULAE", "Brewlert — Formulae"],
  ["RESEND_SEGMENT_CASKS", "Brewlert — Casks"],
  ["RESEND_SEGMENT_BOTH", "Brewlert — Formulae + Casks"],
];

for (const [key, name] of definitions) {
  const { data, error } = await resend.segments.create({ name });
  if (error) throw new Error(`${name}: ${error.message}`);
  console.log(`${key}=${data.id}`);
}
