import React from "react";
import { Icon } from "./Icon";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-xl">
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              danger ? "bg-red-500/10 text-red-500" : "bg-accent/10 text-accent"
            }`}
          >
            <Icon name="alert" className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">{title}</h3>
        </div>
        <p className="mb-5 text-sm text-muted dark:text-muted-dark">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-border dark:border-border-dark px-3.5 py-2 text-sm font-medium text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-bg-dark"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 ${
              danger ? "bg-red-500" : "bg-accent"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
