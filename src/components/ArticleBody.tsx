import type { ReactNode } from "react";

/**
 * Renders the stored article body.
 *
 * The body format is deliberately minimal — blank-line-separated paragraphs
 * with `**bold**` runs and `*italic*` runs. A full markdown parser would be a
 * dependency and an XSS surface for a CMS whose authors are staff; this covers
 * what the newsroom actually writes and escapes everything else by virtue of
 * being React text nodes.
 *
 * Bracketed editor placeholders are pulled out and rendered as a visible note
 * rather than silently printed as body copy (spec §17).
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{token.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={`${keyPrefix}-i${i}`}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="prose-body">
      {blocks.map((block, i) => {
        const isEditorNote = /^\[Editor[:\s]/i.test(block);
        if (isEditorNote) {
          return (
            <span className="editor-note" key={`n-${i}`}>
              <strong className="mr-1.5 uppercase tracking-[0.08em]">Editor’s note —</strong>
              {block.replace(/^\[Editor:\s*/i, "").replace(/\]$/, "")}
            </span>
          );
        }
        return <p key={`p-${i}`}>{inline(block, `p${i}`)}</p>;
      })}
    </div>
  );
}
