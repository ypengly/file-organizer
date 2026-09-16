import React from "react";
import type { ScanResult } from "../types";
import { CATEGORY_ICON, Icon } from "./Icon";
import { CATEGORY_TEXT_COLOR, formatBytes } from "../utils";

export function StatsBar({ scan }: { scan: ScanResult }) {
  const typeCount = Object.keys(scan.category_counts).length;

  return (
    <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-border dark:border-border-dark px-5 py-4">
        <div className="flex items-center gap-2 text-ink dark:text-ink-dark">
          <Icon name="folder" className="h-5 w-5 text-accent" />
          <span className="font-medium">{scan.folder_name}</span>
        </div>
        <Stat label="Files" value={scan.total_files.toLocaleString()} />
        <Stat label="Size" value={formatBytes(scan.total_size)} />
        <Stat label="Types" value={String(typeCount)} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 py-3.5">
        {Object.entries(scan.category_counts)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => (
            <div key={category} className="flex items-center gap-1.5 text-sm">
              <Icon
                name={CATEGORY_ICON[category] ?? "other"}
                className={`h-3.5 w-3.5 ${CATEGORY_TEXT_COLOR[category] ?? "text-cat-other"}`}
              />
              <span className="text-ink dark:text-ink-dark">{category}</span>
              <span className="text-muted dark:text-muted-dark">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-semibold text-ink dark:text-ink-dark">{value}</span>
      <span className="text-sm text-muted dark:text-muted-dark">{label}</span>
    </div>
  );
}
