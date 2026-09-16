import React, { useEffect } from "react";
import { Icon } from "./Icon";

export interface ToastMessage {
  id: number;
  kind: "success" | "error";
  text: string;
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.kind === "error";

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-2.5 rounded-md border px-3.5 py-3 shadow-lg ${
        isError
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
          : "border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
      }`}
    >
      <Icon
        name={isError ? "alert" : "check"}
        className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? "text-red-500" : "text-cat-images"}`}
      />
      <p className="flex-1 text-sm text-ink dark:text-ink-dark">{toast.text}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-muted hover:text-ink dark:hover:text-ink-dark"
      >
        <Icon name="close" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
