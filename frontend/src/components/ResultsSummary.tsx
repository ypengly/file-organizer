import React from "react";
import type { OrganizeStats } from "../types";
import { CATEGORY_ICON, Icon } from "./Icon";
import { CATEGORY_COLOR, CATEGORY_TEXT_COLOR, formatBytes } from "../utils";

export function ResultsSummary({
  stats,
  onUndo,
  undoing,
}: {
  stats: OrganizeStats;
  onUndo: () => void;
  undoing: boolean;
}) {
  const total = Object.values(stats.category_breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cat-images/10 text-cat-images">
          <Icon name="check" className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium text-ink dark:text-ink-dark">
          {stats.files_organized} files organized
        </span>
      </div>

      {Object.keys(stats.category_breakdown).length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-bg dark:bg-bg-dark">
            {Object.entries(stats.category_breakdown).map(([category, count]) => (
              <div
                key={category}
                className={CATEGORY_COLOR[category] ?? "bg-cat-other"}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${category}: ${count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {Object.entries(stats.category_breakdown).map(([category, count]) => (
              <div key={category} className="flex items-center gap-1.5 text-xs">
                <Icon
                  name={CATEGORY_ICON[category] ?? "other"}
                  className={`h-3 w-3 ${CATEGORY_TEXT_COLOR[category] ?? "text-cat-other"}`}
                />
                <span className="text-ink dark:text-ink-dark">{category}</span>
                <span className="text-muted dark:text-muted-dark">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 border-t border-border dark:border-border-dark pt-4 sm:grid-cols-3">
        <Metric label="Folders created" value={String(stats.folders_created)} />
        <Metric label="Space processed" value={formatBytes(stats.space_processed)} />
        <Metric label="Skipped" value={String(stats.skipped_files)} />
        <Metric label="Duplicates" value={String(stats.duplicates)} />
        <Metric label="Time" value={`${stats.time_seconds.toFixed(2)}s`} />
        <Metric label="Failed" value={String(stats.failed.length)} />
      </div>

      {stats.failed.length > 0 && (
        <div className="mb-4 rounded-md bg-red-500/5 px-3 py-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-red-500">
            <Icon name="alert" className="h-3.5 w-3.5" />
            {stats.failed.length} file{stats.failed.length === 1 ? "" : "s"} could not be moved
          </div>
          <ul className="space-y-0.5 font-mono text-[11px] text-muted dark:text-muted-dark">
            {stats.failed.slice(0, 5).map((f, i) => (
              <li key={i} className="truncate">
                {f.path} — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onUndo}
        disabled={undoing || stats.files_organized === 0}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border dark:border-border-dark py-2.5 text-sm font-medium text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-bg-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {undoing ? <Icon name="spinner" className="h-4 w-4" spin /> : <Icon name="undo" className="h-4 w-4" />}
        Undo Last Operation
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-base font-semibold text-ink dark:text-ink-dark">{value}</div>
      <div className="text-xs text-muted dark:text-muted-dark">{label}</div>
    </div>
  );
}
