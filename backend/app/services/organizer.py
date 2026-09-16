"""Builds organization previews and executes them.

Nothing in this module moves a file until execute_organize() is called
with a preview_id that was produced by build_preview(). Previews are
held in memory only.
"""
from __future__ import annotations

import datetime
import shutil
import time
import uuid
from pathlib import Path

from app.models.file import (
    DateSource,
    DuplicateStrategy,
    Operation,
    OrganizeMode,
    OrganizeStats,
    PreviewRequest,
    PreviewResult,
    UndoResult,
)
from app.models.rule import Rule
from app.services.categorizer import categorize
from app.services.duplicate_handler import resolve_duplicate
from app.services.rules_store import rules_store
from app.services.undo_manager import undo_manager
from app.utils.filesystem import (
    ensure_within_root,
    is_dangerous_symlink,
    safe_scan_root,
)

# preview_id -> (root: Path, operations: list[dict])
_PREVIEW_STORE: dict[str, dict] = {}


def _destination_for_type(root: Path, category: str, filename: str) -> Path:
    return root / category / filename


def _destination_for_date(
    root: Path, entry_stat_time: float, filename: str
) -> Path:
    dt = datetime.datetime.fromtimestamp(entry_stat_time)
    return root / str(dt.year) / dt.strftime("%B") / filename


def _matches_rule(rule: Rule, name: str, extension: str, category: str, size: int) -> bool:
    if not rule.enabled:
        return False
    if rule.condition_type == "extension":
        wanted = rule.condition_value if rule.condition_value.startswith(".") else f".{rule.condition_value}"
        return extension.lower() == wanted.lower()
    if rule.condition_type == "filename_contains":
        return rule.condition_value.lower() in name.lower()
    if rule.condition_type == "category":
        return category.lower() == rule.condition_value.lower()
    if rule.condition_type == "size_greater_than":
        try:
            threshold = float(rule.condition_value)
        except ValueError:
            return False
        return size > threshold
    return False


def _destination_for_rules(
    root: Path, name: str, extension: str, category: str, size: int
) -> tuple[Path, bool]:
    """Returns (destination, matched_a_rule)."""
    for rule in rules_store.list():
        if _matches_rule(rule, name, extension, category, size):
            return root / rule.target_folder / name, True
    # Fall back to by-type organization for anything no rule catches.
    return root / category / name, False


def build_preview(req: PreviewRequest) -> PreviewResult:
    root = safe_scan_root(req.folder_path)

    operations: list[Operation] = []
    skipped: list[dict] = []
    total_size = 0
    duplicate_count = 0
    planned_destinations: set[Path] = set()

    entries = sorted(p for p in root.iterdir() if p.is_file())

    for entry in entries:
        if is_dangerous_symlink(entry, root):
            skipped.append({"path": str(entry), "reason": "dangerous symlink"})
            continue
        try:
            stat = entry.stat()
        except OSError as exc:
            skipped.append({"path": str(entry), "reason": f"stat failed: {exc}"})
            continue

        category = categorize(entry.suffix).value

        if req.mode == OrganizeMode.BY_TYPE:
            destination = _destination_for_type(root, category, entry.name)
        elif req.mode == OrganizeMode.BY_DATE:
            time_value = (
                stat.st_mtime
                if req.date_source == DateSource.MODIFIED
                else getattr(stat, "st_birthtime", stat.st_ctime)
            )
            destination = _destination_for_date(root, time_value, entry.name)
        else:  # CUSTOM_RULES
            destination, _ = _destination_for_rules(
                root, entry.name, entry.suffix, category, stat.st_size
            )

        try:
            ensure_within_root(destination, root)
        except Exception as exc:  # noqa: BLE001
            skipped.append({"path": str(entry), "reason": str(exc)})
            continue

        # Avoid collisions between files planned to move to the same spot
        # in *this* preview (e.g. two files with the same name landing in
        # the same category), on top of collisions with what's already
        # on disk.
        if destination in planned_destinations:
            destination = destination.with_name(
                f"{destination.stem} ({uuid.uuid4().hex[:4]}){destination.suffix}"
            )

        decision = resolve_duplicate(destination, req.duplicate_strategy)
        planned_destinations.add(decision.destination)

        if decision.is_duplicate:
            duplicate_count += 1

        operations.append(
            Operation(
                id=uuid.uuid4().hex[:10],
                source=str(entry),
                destination=str(decision.destination),
                category=category,
                size=stat.st_size,
                is_duplicate=decision.is_duplicate,
                will_skip=decision.will_skip,
            )
        )
        total_size += stat.st_size

    preview_id = uuid.uuid4().hex
    _PREVIEW_STORE[preview_id] = {
        "root": root,
        "operations": operations,
        "created_at": time.time(),
    }

    return PreviewResult(
        preview_id=preview_id,
        total_files=len(operations),
        total_size=total_size,
        operations=operations,
        skipped=skipped,
        duplicates=duplicate_count,
    )


def execute_organize(preview_id: str) -> OrganizeStats:
    stored = _PREVIEW_STORE.get(preview_id)
    if stored is None:
        raise KeyError("Preview not found or has expired. Please generate a new preview.")

    root: Path = stored["root"]
    operations: list[Operation] = stored["operations"]

    start = time.perf_counter()
    run = undo_manager.start_run(preview_id)

    files_organized = 0
    skipped_files = 0
    duplicates = 0
    space_processed = 0
    folders_created: set[Path] = set()
    category_breakdown: dict[str, int] = {}
    failed: list[dict] = []

    for op in operations:
        if op.will_skip:
            skipped_files += 1
            continue
        if op.is_duplicate:
            duplicates += 1

        source = Path(op.source)
        destination = Path(op.destination)

        if not source.exists():
            failed.append({"path": op.source, "reason": "source no longer exists"})
            continue

        try:
            ensure_within_root(destination, root)
        except Exception as exc:  # noqa: BLE001
            failed.append({"path": op.source, "reason": str(exc)})
            continue

        try:
            if not destination.parent.exists():
                destination.parent.mkdir(parents=True, exist_ok=True)
                folders_created.add(destination.parent)
            shutil.move(str(source), str(destination))
        except PermissionError:
            failed.append({"path": op.source, "reason": "permission denied"})
            continue
        except OSError as exc:
            failed.append({"path": op.source, "reason": f"locked or inaccessible: {exc}"})
            continue

        undo_manager.record_move(run, str(source), str(destination))
        files_organized += 1
        space_processed += op.size
        category_breakdown[op.category] = category_breakdown.get(op.category, 0) + 1

    for folder in folders_created:
        undo_manager.record_folder(run, str(folder))

    elapsed = time.perf_counter() - start
    del _PREVIEW_STORE[preview_id]

    return OrganizeStats(
        files_organized=files_organized,
        folders_created=len(folders_created),
        space_processed=space_processed,
        skipped_files=skipped_files,
        duplicates=duplicates,
        time_seconds=round(elapsed, 4),
        category_breakdown=category_breakdown,
        failed=failed,
    )


def undo_last() -> UndoResult:
    run = undo_manager.last_undoable_run()
    if run is None:
        raise LookupError("No operation available to undo.")

    restored = 0
    failed: list[dict] = []

    for move in reversed(run.moves):
        new_path = Path(move.new_path)
        original_path = Path(move.original_path)
        if not new_path.exists():
            failed.append({"path": move.new_path, "reason": "file missing, cannot restore"})
            continue
        try:
            original_path.parent.mkdir(parents=True, exist_ok=True)
            if original_path.exists():
                failed.append(
                    {"path": move.new_path, "reason": "original location now occupied"}
                )
                continue
            shutil.move(str(new_path), str(original_path))
            restored += 1
        except OSError as exc:
            failed.append({"path": move.new_path, "reason": str(exc)})

    # Clean up any category/date folders this run created, if now empty.
    for folder in run.folders_created:
        folder_path = Path(folder)
        try:
            if folder_path.exists() and not any(folder_path.iterdir()):
                folder_path.rmdir()
        except OSError:
            pass

    run.undone = True
    return UndoResult(restored_files=restored, failed=failed)
