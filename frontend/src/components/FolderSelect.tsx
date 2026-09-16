import React, { useState } from "react";
import { Icon } from "./Icon";

export function FolderSelect({
  onScan,
  loading,
}: {
  onScan: (path: string) => void;
  loading: boolean;
}) {
  const [path, setPath] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (path.trim()) onScan(path.trim());
      }}
      className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5"
    >
      <label className="mb-2 block text-sm font-medium text-ink dark:text-ink-dark">
        Folder to organize
      </label>
      <p className="mb-3 text-sm text-muted dark:text-muted-dark">
        Enter the full path to a folder on this machine. The backend reads it
        directly — nothing uploads to a server.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon
            name="folder"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/Users/me/Downloads"
            className="w-full rounded-md border border-border dark:border-border-dark bg-bg dark:bg-bg-dark py-2.5 pl-9 pr-3 font-mono text-sm text-ink dark:text-ink-dark placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !path.trim()}
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? <Icon name="spinner" className="h-4 w-4" spin /> : <Icon name="search" className="h-4 w-4" />}
          Scan
        </button>
      </div>
    </form>
  );
}
