import React, { useEffect, useState } from "react";
import { api, ApiRequestError } from "./api/client";
import { ActionBar } from "./components/ActionBar";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { FolderSelect } from "./components/FolderSelect";
import { Icon } from "./components/Icon";
import { ModeSelector } from "./components/ModeSelector";
import { PreviewTable } from "./components/PreviewTable";
import { ResultsSummary } from "./components/ResultsSummary";
import { RulesPanel } from "./components/RulesPanel";
import { StatsBar } from "./components/StatsBar";
import { ThemeToggle } from "./components/ThemeToggle";
import { ToastStack, type ToastMessage } from "./components/Toast";
import type {
  DateSource,
  DuplicateStrategy,
  OrganizeMode,
  OrganizeStats,
  PreviewResult,
  ScanResult,
} from "./types";

let toastId = 0;

export default function App() {
  const [dark, setDark] = useState<boolean>(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );

  const [scan, setScan] = useState<ScanResult | null>(null);
  const [mode, setMode] = useState<OrganizeMode>("by_type");
  const [dateSource, setDateSource] = useState<DateSource>("modified");
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("rename");

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [stats, setStats] = useState<OrganizeStats | null>(null);

  const [scanning, setScanning] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function notify(kind: ToastMessage["kind"], text: string) {
    const id = ++toastId;
    setToasts((t) => [...t, { id, kind, text }]);
  }

  function dismissToast(id: number) {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }

  async function handleScan(path: string) {
    setScanning(true);
    setScan(null);
    setPreview(null);
    setStats(null);
    try {
      const result = await api.scan(path);
      setScan(result);
      await refreshPreview(result.folder_path, mode, dateSource, duplicateStrategy);
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Could not scan that folder.");
    } finally {
      setScanning(false);
    }
  }

  async function refreshPreview(
    folderPath: string,
    m: OrganizeMode,
    ds: DateSource,
    dup: DuplicateStrategy
  ) {
    setPreviewing(true);
    try {
      const result = await api.preview({
        folder_path: folderPath,
        mode: m,
        date_source: ds,
        duplicate_strategy: dup,
      });
      setPreview(result);
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Could not build a preview.");
    } finally {
      setPreviewing(false);
    }
  }

  function onModeChange(m: OrganizeMode) {
    setMode(m);
    if (scan) refreshPreview(scan.folder_path, m, dateSource, duplicateStrategy);
  }

  function onDateSourceChange(d: DateSource) {
    setDateSource(d);
    if (scan) refreshPreview(scan.folder_path, mode, d, duplicateStrategy);
  }

  function onDuplicateStrategyChange(d: DuplicateStrategy) {
    setDuplicateStrategy(d);
    if (scan) refreshPreview(scan.folder_path, mode, dateSource, d);
  }

  function onRulesChanged() {
    if (scan) refreshPreview(scan.folder_path, mode, dateSource, duplicateStrategy);
  }

  function requestOrganize() {
    setConfirmOpen(true);
  }

  async function handleOrganize() {
    if (!preview) return;
    setConfirmOpen(false);
    setOrganizing(true);
    try {
      const result = await api.organize(preview.preview_id);
      setStats(result);
      setPreview(null);
      notify("success", `${result.files_organized} files organized.`);
      if (scan) {
        const rescanned = await api.scan(scan.folder_path);
        setScan(rescanned);
      }
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Organizing failed.");
    } finally {
      setOrganizing(false);
    }
  }

  function handleCancel() {
    setPreview(null);
    setScan(null);
  }

  async function handleUndo() {
    setUndoing(true);
    try {
      const result = await api.undo();
      notify("success", `Restored ${result.restored_files} files.`);
      if (scan) {
        const rescanned = await api.scan(scan.folder_path);
        setScan(rescanned);
      }
      setStats(null);
    } catch (err) {
      notify("error", err instanceof ApiRequestError ? err.message : "Nothing to undo.");
    } finally {
      setUndoing(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink dark:bg-bg-dark dark:text-ink-dark">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <header className="border-b border-border dark:border-border-dark">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white">
              <Icon name="folder" className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-tight">File Organizer</h1>
              <p className="text-xs leading-tight text-muted dark:text-muted-dark">
                Keep your files clean and organized
              </p>
            </div>
          </div>
          <ThemeToggle dark={dark} onToggle={() => setDark((v) => !v)} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-6 py-6 pb-24">
        <FolderSelect onScan={handleScan} loading={scanning} />

        {!scan && !scanning && (
          <div className="rounded-lg border border-dashed border-border dark:border-border-dark px-5 py-14 text-center">
            <Icon name="folder" className="mx-auto mb-3 h-8 w-8 text-muted" />
            <p className="text-sm font-medium">No folder scanned yet</p>
            <p className="mt-1 text-sm text-muted dark:text-muted-dark">
              Point this at a folder to see what's inside before anything moves.
            </p>
          </div>
        )}

        {scan && (
          <>
            {stats ? (
              <ResultsSummary stats={stats} onUndo={handleUndo} undoing={undoing} />
            ) : (
              <>
                <div className="animate-[fadeIn_0.2s_ease-out]">
                  <StatsBar scan={scan} />
                </div>

                <ModeSelector
                  mode={mode}
                  onModeChange={onModeChange}
                  dateSource={dateSource}
                  onDateSourceChange={onDateSourceChange}
                  duplicateStrategy={duplicateStrategy}
                  onDuplicateStrategyChange={onDuplicateStrategyChange}
                />

                {mode === "custom_rules" && <RulesPanel onRulesChanged={onRulesChanged} />}

                {previewing ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-border dark:border-border-dark py-16 text-sm text-muted dark:text-muted-dark">
                    <Icon name="spinner" className="h-4 w-4" spin />
                    Building preview…
                  </div>
                ) : (
                  preview && <PreviewTable preview={preview} folderPath={scan.folder_path} />
                )}

                {preview && preview.total_files > 0 && (
                  <ActionBar
                    fileCount={preview.total_files}
                    onCancel={handleCancel}
                    onOrganize={requestOrganize}
                    loading={organizing}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {confirmOpen && preview && (
        <ConfirmDialog
          title="Organize files?"
          message={`${preview.total_files} files will be moved into new folders inside ${scan?.folder_name}. Nothing is deleted, and you can undo this right after.`}
          confirmLabel="Organize Files"
          onConfirm={handleOrganize}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
