import { installCommand, type Addition } from "@/lib/homebrew";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
  })[character] ?? character);
}

function webUrl(value: string | null) {
  if (!value) return null;
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function formulaeUrl(addition: Addition) {
  return `https://formulae.brew.sh/${addition.kind}/${encodeURIComponent(addition.name)}`;
}

function formatRange(start: Date, end: Date) {
  const lastDay = new Date(end);
  lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${formatter.format(start)}–${formatter.format(lastDay)}`;
}

export function digestHtml(additions: Addition[], start: Date, end: Date) {
  const rows = additions.map((addition) => {
    const type = addition.kind === "formula" ? "Formula" : "Cask";
    const name = escapeHtml(addition.displayName);
    const description = escapeHtml(addition.description);
    const version = addition.version ? `<span style="color:#8c8880">${escapeHtml(addition.version)}</span>` : "";
    const homepageUrl = webUrl(addition.homepage);
    const homepage = homepageUrl
      ? `<br><a href="${escapeHtml(homepageUrl)}" style="display:inline-block;margin-top:8px;color:#9a5a00;font:13px Arial,sans-serif">Homepage ↗</a>`
      : "";
    const formulae = `<br><a href="${escapeHtml(formulaeUrl(addition))}" style="display:inline-block;margin-top:8px;color:#9a5a00;font:13px Arial,sans-serif">Homebrew Formulae ↗</a>`;
    return `<tr><td style="padding:22px 0;border-bottom:1px solid #dedbd3">
      <table role="presentation" width="100%"><tr>
        <td style="vertical-align:top"><div style="font:700 18px Arial,sans-serif;color:#171512">${name} ${version}</div>
        <div style="margin-top:6px;font:15px/1.5 Arial,sans-serif;color:#5d5951">${description}</div>
        <code style="display:inline-block;margin-top:10px;padding:5px 8px;background:#efede7;border-radius:4px;color:#171512">${escapeHtml(installCommand(addition))}</code></td>
        <td align="right" style="width:130px;vertical-align:top"><span style="font:12px monospace;color:#9a5a00;text-transform:uppercase">${type}</span><br><a href="${escapeHtml(addition.prUrl)}" style="display:inline-block;margin-top:10px;color:#9a5a00;font:13px Arial,sans-serif">PR ↗</a>${homepage}${formulae}</td>
      </tr></table>
    </td></tr>`;
  }).join("");

  return `<!doctype html><html><body style="margin:0;background:#eeece6;color:#171512">
    <div style="display:none;max-height:0;overflow:hidden">${additions.length} new Homebrew additions from ${formatRange(start, end)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:36px 16px">
      <table role="presentation" width="100%" style="max-width:620px;background:#fff;padding:38px;border-top:5px solid #f4a622">
        <tr><td><div style="font:700 20px Arial,sans-serif;color:#171512">▰ Brewlert</div>
        <h1 style="margin:34px 0 8px;font:800 36px/1.1 Arial,sans-serif">Fresh pours · ${formatRange(start, end)}</h1>
        <p style="margin:0 0 24px;font:16px/1.5 Arial,sans-serif;color:#5d5951">${additions.length} new formulae and casks landed in Homebrew this week.</p></td></tr>
        ${rows || `<tr><td style="padding:28px 0;font:16px/1.5 Arial,sans-serif">A quiet week—no new additions matched your preferences.</td></tr>`}
        <tr><td style="padding-top:32px;font:13px/1.6 Arial,sans-serif;color:#77726a">You’re receiving this because you subscribed to Brewlert. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#9a5a00">Unsubscribe</a>.</td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}
