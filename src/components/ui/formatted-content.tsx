import React from "react";

interface FormattedContentProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and `code`
 */
function renderInline(text: string): React.ReactNode[] {
  // Regex to split by bold (**...**), italic (*...*), or code (`...`)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-sky-300 text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * FormattedContent renders medical answers and question stems cleanly without
 * displaying raw markdown syntax like '#', '**', '*', or '|'.
 */
export function FormattedContent({ content, className }: FormattedContentProps) {
  if (!content) return null;

  const rawLines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // 1. Detect Tables: line starts and ends with '|'
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is header
        const headers = tableLines[0]
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        // Row 1 is divider (|---|---|), subsequent lines are data rows
        const rows = tableLines.slice(2).map((rowLine) =>
          rowLine
            .split("|")
            .map((c) => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        );

        nodes.push(
          <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-slate-200 border-b border-white/10">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-semibold">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 bg-black/20">
                {rows.map((r, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02]">
                    {r.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Headings: ###, ##, #
    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={`h4-${i}`}
          className="text-xs sm:text-sm font-bold text-indigo-300 font-['Space_Grotesk'] uppercase tracking-wider mt-4 mb-1.5 first:mt-0 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
          <span>{renderInline(line.replace(/^###\s+/, ""))}</span>
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      nodes.push(
        <h3
          key={`h3-${i}`}
          className="text-sm sm:text-base font-bold text-white font-['Space_Grotesk'] mt-5 mb-2 first:mt-0"
        >
          {renderInline(line.replace(/^##\s+/, ""))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      nodes.push(
        <h2
          key={`h2-${i}`}
          className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] mt-6 mb-2 first:mt-0"
        >
          {renderInline(line.replace(/^#\s+/, ""))}
        </h2>
      );
      i++;
      continue;
    }

    // 3. Bullet points: '* ' or '- '
    if (line.startsWith("* ") || line.startsWith("- ")) {
      const cleanText = line.replace(/^[\*\-]\s+/, "");
      nodes.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 pl-1 text-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 mt-1.5 shrink-0" />
          <div className="flex-1 leading-relaxed">{renderInline(cleanText)}</div>
        </div>
      );
      i++;
      continue;
    }

    // 4. Numbered list: '1. ', '2. ', etc.
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      nodes.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1 text-slate-200">
          <span className="text-xs font-mono font-bold text-indigo-300 shrink-0 mt-0.5">
            {numberedMatch[1]}.
          </span>
          <div className="flex-1 leading-relaxed">{renderInline(numberedMatch[2])}</div>
        </div>
      );
      i++;
      continue;
    }

    // 5. Lettered list: '(a) ', '(b) ', etc.
    const letterMatch = line.match(/^(\([a-zA-Z]\))\s+(.*)/);
    if (letterMatch) {
      nodes.push(
        <div key={`let-${i}`} className="flex items-start gap-2.5 my-1.5 pl-1 text-slate-200">
          <span className="text-xs font-mono font-bold text-sky-300 shrink-0 mt-0.5">
            {letterMatch[1]}
          </span>
          <div className="flex-1 leading-relaxed">{renderInline(letterMatch[2])}</div>
        </div>
      );
      i++;
      continue;
    }

    // 6. Regular text paragraph
    nodes.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-slate-200">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className={className}>{nodes}</div>;
}
