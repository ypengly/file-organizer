import React from "react";
import { Icon } from "./Icon";

export function ThemeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border dark:border-border-dark text-ink dark:text-ink-dark hover:bg-bg dark:hover:bg-bg-dark"
    >
      <Icon name={dark ? "sun" : "moon"} className="h-4 w-4" />
    </button>
  );
}
