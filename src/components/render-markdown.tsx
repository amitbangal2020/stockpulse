import type { ReactNode } from "react";

// ─── Minimal Markdown Renderer ───
// Supports the subset used by blog posts: ##/### headings, paragraphs,
// **bold**, *italic*, `code`, - lists, 1. lists, and > blockquotes.
// Deliberately dependency-free — blog posts are trusted first-party content.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on bold, italic and code while keeping the delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push(<em key={`${keyPrefix}-i${i}`}>{part.slice(1, -1)}</em>);
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-bg-secondary px-1.5 py-0.5 font-mono text-[0.9em] text-accent">
          {part.slice(1, -1)}
        </code>
      );
    } else {
      nodes.push(<span key={`${keyPrefix}-t${i}`}>{part}</span>);
    }
  });
  return nodes;
}

export function RenderMarkdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];
  let listOrdered = false;
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={`p${key++}`} className="leading-relaxed text-text-secondary">
        {renderInline(paragraph.join(" "), `p${key}`)}
      </p>
    );
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = listItems.map((li, i) => (
      <li key={`li${i}`} className="leading-relaxed text-text-secondary">
        {renderInline(li.text, `li${key}-${i}`)}
      </li>
    ));
    blocks.push(
      listOrdered ? (
        <ol key={`ol${key++}`} className="list-decimal space-y-1.5 pl-5 marker:text-accent">
          {items}
        </ol>
      ) : (
        <ul key={`ul${key++}`} className="list-disc space-y-1.5 pl-5 marker:text-accent">
          {items}
        </ul>
      )
    );
    listItems = [];
  };

  const isTableRow = (value: string) => /^\|.*\|$/.test(value.trim());

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trimEnd();

    if (isTableRow(line)) {
      // A table is a run of | cells | lines; the header separator (|---|---|)
      // is dropped rather than rendered.
      flushParagraph();
      flushList();
      const rows: string[][] = [];
      while (li < lines.length && isTableRow(lines[li])) {
        rows.push(
          lines[li]
            .trim()
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim())
        );
        li++;
      }
      li--; // the loop's own increment steps past the table

      const [head, ...body] = rows.filter(
        (row) => !row.every((cell) => /^:?-{2,}:?$/.test(cell))
      );
      if (head) {
        blocks.push(
          <div key={`tbl${key++}`} className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  {head.map((cell, i) => (
                    <th
                      key={`th${i}`}
                      className="border-b border-border px-3 py-2 font-semibold text-text-primary"
                    >
                      {renderInline(cell, `th${i}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={`tr${ri}`}>
                    {row.map((cell, ci) => (
                      <td
                        key={`td${ri}-${ci}`}
                        className="border-b border-border/60 px-3 py-2 align-top text-text-secondary"
                      >
                        {renderInline(cell, `td${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3${key++}`} className="pt-2 text-base font-semibold text-text-primary">
          {renderInline(line.slice(4), `h3${key}`)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2 key={`h2${key++}`} className="pt-4 text-lg font-bold text-text-primary">
          {renderInline(line.slice(3), `h2${key}`)}
        </h2>
      );
    } else if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`q${key++}`} className="rounded-r-lg border-l-4 border-accent bg-accent-subtle px-4 py-2 text-sm italic text-text-secondary">
          {renderInline(line.slice(2), `q${key}`)}
        </blockquote>
      );
    } else if (/^- /.test(line)) {
      flushParagraph();
      if (listItems.length > 0 && listOrdered) flushList();
      listOrdered = false;
      listItems.push({ ordered: false, text: line.slice(2) });
    } else if (/^\d+\. /.test(line)) {
      flushParagraph();
      if (listItems.length > 0 && !listOrdered) flushList();
      listOrdered = true;
      listItems.push({ ordered: true, text: line.replace(/^\d+\. /, "") });
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return <div className="space-y-4 text-sm">{blocks}</div>;
}
