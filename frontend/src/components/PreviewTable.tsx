import React, { useMemo, useState } from "react";
import type { PreviewResult } from "../types";
import { CATEGORY_ICON, Icon } from "./Icon";
import { CATEGORY_TEXT_COLOR, formatBytes, relativeToFolder } from "../utils";

export function PreviewTable({
  preview,
  folderPath,
}: {
  preview: PreviewResult;
  folderPath: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return preview.operations;
    const q = query.toLowerCase();
    return preview.operations.filter(
      (op) =>
        op.source.toLowerCase().includes(q) ||
        op.destination.toLowerCase().includes(q) ||
        op.category.toLowerCase().includes(q)
    );
  }, [preview.operations, query]);

  if (preview.operations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-5 py-12 text-center">
        <Icon name="folder" className="mx-auto mb-3 h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-ink dark:text-ink-dark">
          Nothing to organize
        </p>
        <p className="mt-1 text-sm text-muted dark:text-muted-dark">
          This folder is already tidy — every file matched its current
          location.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
      <div className="flex items-center justify-between gap-3 border-b border-border dark:border-border-dark px-5 py-3">
        <div>
          <span className="text-sm font-medium text-ink dark:text-ink-dark">
            Preview
          </span>
          <span className="ml-2 text-xs text-muted dark:text-muted-dark">
            {preview.total_files} files · {formatBytes(preview.total_size)}
            {preview.duplicates > 0 ? ` · ${preview.duplicates} duplicates` : ""}
          </span>
        </div>
        {preview.operations.length > 8 && (
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter files"
              className="rounded-sm border border-border dark:border-border-dark bg-bg dark:bg-bg-dark py-1.5 pl-8 pr-2.5 text-xs text-ink dark:text-ink-dark placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <tbody>
            {filtered.map((op) => (
              <tr
                key={op.id}
                className="border-b border-border/60 dark:border-border-dark/60 last:border-0"
              >
                <td className="w-6 py-2.5 pl-5">
                  <Icon
                    name={CATEGORY_ICON[op.category] ?? "other"}
                    className={`h-4 w-4 ${CATEGORY_TEXT_COLOR[op.category] ?? "text-cat-other"}`}
                  />
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs text-muted dark:text-muted-dark">
                  <span className="truncate">{relativeToFolder(op.source, folderPath)}</span>
                </td>
                <td className="w-8 py-2.5 text-muted">
                  <Icon name="chevron-right" className="h-3.5 w-3.5" />
                </td>
                <td className="py-2.5 pr-3 font-mono text-xs text-ink dark:text-ink-dark">
                  {relativeToFolder(op.destination, folderPath)}
                </td>
                <td className="whitespace-nowrap py-2.5 pr-3 text-right text-xs text-muted dark:text-muted-dark">
                  {formatBytes(op.size)}
                </td>
                <td className="whitespace-nowrap py-2.5 pr-5 text-right">
                  {op.will_skip ? (
                    <span className="rounded-full bg-muted/10 px-2 py-0.5 text-[11px] font-medium text-muted">
                      Skip
                    </span>
                  ) : op.is_duplicate ? (
                    <span className="rounded-full bg-cat-audio/10 px-2 py-0.5 text-[11px] font-medium text-cat-audio">
                      Renamed
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
