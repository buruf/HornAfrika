"use client";

import { useState } from "react";
import { transitionArticle } from "@/app/admin/articles/actions";

type Props = {
  id: string;
  moves: string[];
  labels: Record<string, string>;
  colors: Record<string, string>;
};

/**
 * One form per transition, each carrying its target status as a hidden field.
 *
 * A single form with several `name="to"` submit buttons depends on the
 * submitter's value reaching the action, which is not reliable across
 * programmatic submits and no-JS fallbacks. Making the target explicit removes
 * that dependency, and the shared note is copied into whichever form is used.
 */
export function WorkflowBar({ id, moves, labels, colors }: Props) {
  const [note, setNote] = useState("");

  if (moves.length === 0) {
    return (
      <p className="ml-auto text-[0.82rem] text-ink-mute">
        No workflow moves available to your role from this status.
      </p>
    );
  }

  return (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="workflow-note">
        Note
      </label>
      <input
        id="workflow-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="border border-rule-strong px-3 py-1.5 text-[0.82rem] outline-none focus:border-ink"
      />
      {moves.map((to) => (
        <form key={to} action={transitionArticle}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="to" value={to} />
          <input type="hidden" name="note" value={note} />
          <button
            type="submit"
            className="px-3 py-1.5 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-85"
            style={{ background: colors[to] }}
          >
            {labels[to]}
          </button>
        </form>
      ))}
    </div>
  );
}
