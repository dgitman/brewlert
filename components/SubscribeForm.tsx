"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { FormEvent, useState } from "react";

type Status = { kind: "idle" | "loading" | "success" | "error"; message?: string };

export function SubscribeForm() {
  const [formulae, setFormulae] = useState(true);
  const [casks, setCasks] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!formulae && !casks) {
      setStatus({ kind: "error", message: "Choose formulae, casks, or both." });
      return;
    }
    const form = new FormData(formElement);
    setStatus({ kind: "loading" });
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), formulae, casks }),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to subscribe right now.");
      setStatus({ kind: "success", message: result.message ?? "You’re on the list." });
      formElement.reset();
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Unable to subscribe." });
    }
  }

  return (
    <form className="subscribe-form" onSubmit={submit} id="subscribe">
      <label className="sr-only" htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      <div className="choices" aria-label="Digest preferences">
        <label><input type="checkbox" checked={formulae} onChange={(event) => setFormulae(event.target.checked)} /><span />Formulae</label>
        <label><input type="checkbox" checked={casks} onChange={(event) => setCasks(event.target.checked)} /><span />Casks</label>
      </div>
      <button
        type="submit"
        disabled={status.kind === "loading"}
        onClick={() => sendGAEvent("event", "get_digest_click", {
          digest_preferences: formulae && casks ? "formulae_and_casks" : formulae ? "formulae" : casks ? "casks" : "none",
        })}
      >
        {status.kind === "loading" ? "Joining…" : "Get the digest"}
      </button>
      <p className={`form-note ${status.kind === "error" ? "error" : ""}`} role="status">
        {status.message ?? "No spam. Unsubscribe anytime."}
      </p>
    </form>
  );
}
