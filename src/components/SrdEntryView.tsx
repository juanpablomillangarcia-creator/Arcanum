"use client";

import type { SrdEntry } from "@/src/data/srd";
import { typeLabel, formatSectionHtml } from "@/src/lib/search";

export function SrdEntryView({
  entry,
  onEdit,
  onDelete,
}: {
  entry: SrdEntry & { source: string };
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const label = typeLabel(entry.type);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase mb-1" style={{ color: "var(--acc)" }}>
          {label} {entry.source === "homebrew" ? "· Homebrew" : "· SRD 5.1"}
        </div>
        <h2 className="font-[var(--font-display)] text-2xl text-ink">{entry.name}</h2>
        {entry.meta && (
          <div className="text-sm text-ink-dim mt-0.5">{entry.meta}</div>
        )}
      </div>

      {entry.text && (
        <div className="text-sm text-ink-dim">{entry.text}</div>
      )}

      {entry.sections?.map((s, i) => {
        const isSubHeader = /━━━/.test(s.t);
        if (isSubHeader) {
          return (
            <div key={i}>
              <div className="font-[var(--font-title)] text-lg text-ink mt-2 mb-1">
                {s.t.replace(/━━━/g, "").trim()}
              </div>
              <div dangerouslySetInnerHTML={{ __html: formatSectionHtml(s.d) }} />
            </div>
          );
        }
        return (
          <div key={i}>
            <div className="font-[var(--font-title)] text-base text-ink border-b border-[var(--line)] pb-0.5 mb-1">
              {s.t}
            </div>
            <div dangerouslySetInnerHTML={{ __html: formatSectionHtml(s.d) }} />
          </div>
        );
      })}

      {entry.source === "homebrew" && (onEdit || onDelete) && (
        <div className="flex gap-2 pt-2 border-t border-[var(--line)]">
          {onEdit && (
            <button className="btn btn-ghost !py-1 !min-h-[36px] !text-[11px]" onClick={onEdit}>
              Editar
            </button>
          )}
          {onDelete && (
            <button className="btn btn-ghost !py-1 !min-h-[36px] !text-[11px]" style={{ color: "var(--blood)" }} onClick={onDelete}>
              Borrar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
