"use client";

import { useState } from "react";

type Props = {
  variant?: "dark" | "light";
  showCountry?: boolean;
  defaultCountry?: string;
};

const COUNTRIES = [
  { value: "", label: "All of the Horn" },
  { value: "somalia", label: "Somalia edition" },
  { value: "ethiopia", label: "Ethiopia edition" },
  { value: "djibouti", label: "Djibouti edition" },
  { value: "eritrea", label: "Eritrea edition" },
];

export function NewsletterForm({
  variant = "dark",
  showCountry = false,
  defaultCountry = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [countryPref, setCountryPref] = useState(defaultCountry);
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const dark = variant === "dark";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setState("error");
      setMessage("Please agree to receive the newsletter.");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, countryPref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("done");
      setMessage(data.message ?? "You're subscribed.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <p
        className={`border px-3 py-2.5 text-[0.85rem] ${
          dark ? "border-white/25 bg-white/5 text-white" : "border-rule bg-shell text-ink"
        }`}
      >
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div className="flex">
        <label className="sr-only" htmlFor={`nl-email-${variant}`}>
          Email address
        </label>
        <input
          id={`nl-email-${variant}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={`min-w-0 flex-1 px-3 py-2.5 text-[0.85rem] outline-none ${
            dark
              ? "bg-white text-ink placeholder:text-ink-mute"
              : "border border-rule-strong bg-white text-ink placeholder:text-ink-mute"
          }`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 bg-brand px-4 py-2.5 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {state === "sending" ? "…" : "Subscribe"}
        </button>
      </div>

      {showCountry && (
        <>
          <label className="sr-only" htmlFor={`nl-country-${variant}`}>
            Country edition
          </label>
          <select
            id={`nl-country-${variant}`}
            value={countryPref}
            onChange={(e) => setCountryPref(e.target.value)}
            className={`w-full px-3 py-2 text-[0.82rem] outline-none ${
              dark ? "bg-white/10 text-white" : "border border-rule-strong bg-white text-ink"
            }`}
          >
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value} className="text-ink">
                {c.label}
              </option>
            ))}
          </select>
        </>
      )}

      <label
        className={`flex cursor-pointer items-start gap-2 text-[0.76rem] ${
          dark ? "text-white/70" : "text-ink-soft"
        }`}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 accent-[#c9182b]"
        />
        <span>I agree to receive newsletters</span>
      </label>

      {state === "error" && (
        <p className={`text-[0.78rem] ${dark ? "text-red-300" : "text-brand"}`}>{message}</p>
      )}
    </form>
  );
}
