import React from "react";
import { Icon } from "./Icon";

export function ActionBar({
  fileCount,
  onCancel,
  onOrganize,
  loading,
}: {
  fileCount: number;
  onCancel: () => void;
  onOrganize: () => void;
  loading: boolean;
}) {
  return (
    <div className="sticky bottom-4 flex items-center justify-between rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-5 py-3.5 shadow-lg shadow-black/5">
      <span className="text-sm text-muted dark:text-muted-dark">
        {fileCount} file{fileCount === 1 ? "" : "s"} ready to organize
      </span>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="rounded-md border border-border dark:border-border-dark px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-bg-dark"
        >
          Cancel
        </button>
        <button
          onClick={onOrganize}
          disabled={loading || fileCount === 0}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading && <Icon name="spinner" className="h-4 w-4" spin />}
          Organize Files
        </button>
      </div>
    </div>
  );
}
