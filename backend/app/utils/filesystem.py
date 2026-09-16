"""Filesystem safety helpers.

Every function that touches disk in this application routes through
here first. The goal is a single, auditable choke point for the
safety rules described in the product spec:

- never operate on system directories
- never follow symlinks off the target tree
- never allow a destination to escape the organized root (path traversal)
- never execute anything
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Directories we refuse to scan or organize, even if the user points at
# them directly or a nested path resolves into them.
_UNIX_SYSTEM_ROOTS = {
    "/", "/bin", "/boot", "/dev", "/etc", "/lib", "/lib64", "/proc",
    "/root", "/run", "/sbin", "/sys", "/usr", "/usr/bin", "/usr/lib",
    "/usr/sbin", "/var", "/var/run", "/System", "/Library", "/private",
}
_WINDOWS_SYSTEM_ROOTS = {
    "c:\\windows", "c:\\program files", "c:\\program files (x86)",
    "c:\\programdata",
}


class UnsafePathError(ValueError):
    """Raised when a path fails a safety check."""


def resolve_strict(path: str) -> Path:
    """Resolve a user-supplied path to an absolute, real path.

    Raises UnsafePathError if the path does not exist or cannot be
    resolved (e.g. it is a dangling symlink).
    """
    try:
        resolved = Path(path).expanduser().resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise UnsafePathError(f"Could not resolve path: {path}") from exc
    return resolved


def ensure_not_system_directory(path: Path) -> None:
    normalized = str(path).lower().rstrip("/\\")
    if sys.platform.startswith("win"):
        if normalized in _WINDOWS_SYSTEM_ROOTS:
            raise UnsafePathError("Refusing to organize a system directory.")
    else:
        if str(path) in _UNIX_SYSTEM_ROOTS or str(path) == str(Path.home()):
            # Allow subfolders of home, but not the home root itself, and
            # never a bare OS root.
            if str(path) != str(Path.home()):
                raise UnsafePathError("Refusing to organize a system directory.")
    # Also refuse if the resolved path IS one of the unix roots regardless
    # of platform (covers containers / cross-platform dev).
    if str(path) in _UNIX_SYSTEM_ROOTS:
        raise UnsafePathError("Refusing to organize a system directory.")


def ensure_is_directory(path: Path) -> None:
    if not path.is_dir():
        raise UnsafePathError(f"Not a directory: {path}")


def ensure_within_root(candidate: Path, root: Path) -> None:
    """Guard against path traversal: candidate must live under root."""
    try:
        candidate.resolve().relative_to(root.resolve())
    except ValueError as exc:
        raise UnsafePathError(
            f"Path {candidate} escapes the organized root {root}."
        ) from exc


def is_dangerous_symlink(path: Path, root: Path) -> bool:
    """True if `path` is a symlink pointing outside `root`."""
    if not path.is_symlink():
        return False
    try:
        target = path.resolve(strict=True)
    except OSError:
        return True  # broken symlink — treat as dangerous, skip it
    try:
        target.relative_to(root.resolve())
        return False
    except ValueError:
        return True


def safe_scan_root(raw_path: str) -> Path:
    """Full validation pipeline for a folder the user wants to scan/organize."""
    root = resolve_strict(raw_path)
    ensure_is_directory(root)
    ensure_not_system_directory(root)
    return root


def unique_destination(destination: Path) -> Path:
    """Given a proposed destination, find a non-colliding filename by
    appending ' (1)', ' (2)', etc. Never overwrites."""
    if not destination.exists():
        return destination
    stem, suffix, parent = destination.stem, destination.suffix, destination.parent
    counter = 1
    while True:
        candidate = parent / f"{stem} ({counter}){suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def human_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024 or unit == "TB":
            return f"{size:.2f} {unit}" if unit != "B" else f"{int(size)} {unit}"
        size /= 1024
    return f"{size:.2f} TB"
