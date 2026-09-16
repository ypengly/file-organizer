import React from "react";
import type { DateSource, DuplicateStrategy, OrganizeMode } from "../types";

const MODES: { value: OrganizeMode; label: string }[] = [
  { value: "by_type", label: "By Type" },
  { value: "by_date", label: "By Date" },
  { value: "custom_rules", label: "Custom Rules" },
];

export function ModeSelector({
  mode,
  onModeChange,
  dateSource,
  onDateSourceChange,
  duplicateStrategy,
  onDuplicateStrategyChange,
}: {
  mode: OrganizeMode;
  onModeChange: (m: OrganizeMode) => void;
  dateSource: DateSource;
  onDateSourceChange: (d: DateSource) => void;
  duplicateStrategy: DuplicateStrategy;
  onDuplicateStrategyChange: (d: DuplicateStrategy) => void;
}) {
  return (
    <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-ink dark:text-ink-dark">
          Organization mode
        </span>
      </div>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-md bg-bg dark:bg-bg-dark p-1">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`rounded-sm px-3 py-2 text-sm font-medium transition ${
              mode === m.value
                ? "bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark shadow-sm"
                : "text-muted hover:text-ink dark:hover:text-ink-dark"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "by_date" && (
        <div className="flex items-center justify-between rounded-md bg-bg dark:bg-bg-dark px-3 py-2.5">
          <span className="text-sm text-muted dark:text-muted-dark">Date source</span>
          <div className="flex gap-1">
            {(["modified", "created"] as DateSource[]).map((d) => (
              <button
                key={d}
                onClick={() => onDateSourceChange(d)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium capitalize transition ${
                  dateSource === d
                    ? "bg-accent text-white"
                    : "text-muted hover:text-ink dark:hover:text-ink-dark"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-md bg-bg dark:bg-bg-dark px-3 py-2.5">
        <span className="text-sm text-muted dark:text-muted-dark">
          If a file already exists
        </span>
        <select
          value={duplicateStrategy}
          onChange={(e) => onDuplicateStrategyChange(e.target.value as DuplicateStrategy)}
          className="rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1 text-xs font-medium text-ink dark:text-ink-dark focus:border-accent focus:outline-none"
        >
          <option value="rename">Rename automatically</option>
          <option value="skip">Skip</option>
          <option value="ask">Ask me</option>
          <option value="replace">Replace (confirm each time)</option>
        </select>
      </div>
    </div>
  );
}
