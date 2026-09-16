"""Scans a folder (non-recursive at the top level, skipping already
organized category folders is left to the organizer) and reports on
what's in it."""
from __future__ import annotations

from pathlib import Path

from app.models.file import Category, FileEntry, ScanResult
from app.services.categorizer import categorize
from app.utils.filesystem import is_dangerous_symlink, safe_scan_root


def scan_folder(raw_path: str) -> ScanResult:
    root = safe_scan_root(raw_path)

    files: list[FileEntry] = []
    category_counts: dict[str, int] = {}
    total_size = 0

    for entry in sorted(root.iterdir()):
        if entry.is_dir():
            continue
        if is_dangerous_symlink(entry, root):
            continue
        try:
            stat = entry.stat()
        except OSError:
            continue

        category = categorize(entry.suffix)
        file_entry = FileEntry(
            name=entry.name,
            path=str(entry),
            extension=entry.suffix.lower(),
            size=stat.st_size,
            category=category,
            modified_at=stat.st_mtime,
            created_at=getattr(stat, "st_birthtime", stat.st_ctime),
        )
        files.append(file_entry)
        total_size += stat.st_size
        category_counts[category.value] = category_counts.get(category.value, 0) + 1

    return ScanResult(
        folder_path=str(root),
        folder_name=root.name or str(root),
        total_files=len(files),
        total_size=total_size,
        category_counts=category_counts,
        files=files,
    )
