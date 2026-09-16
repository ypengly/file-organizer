"""Keeps a short-lived, in-memory history of move operations so the most
recent organize run can be reversed.

This is intentionally process-local and non-persistent (per the "no
database required" requirement) — it is a session-scoped safety net,
not an audit log.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class MoveRecord:
    original_path: str
    new_path: str
    timestamp: float


@dataclass
class OrganizeRun:
    run_id: str
    moves: list[MoveRecord] = field(default_factory=list)
    folders_created: list[str] = field(default_factory=list)
    undone: bool = False


class UndoManager:
    def __init__(self) -> None:
        self._history: list[OrganizeRun] = []

    def start_run(self, run_id: str) -> OrganizeRun:
        run = OrganizeRun(run_id=run_id)
        self._history.append(run)
        return run

    def record_move(self, run: OrganizeRun, original: str, new: str) -> None:
        run.moves.append(MoveRecord(original, new, time.time()))

    def record_folder(self, run: OrganizeRun, folder: str) -> None:
        if folder not in run.folders_created:
            run.folders_created.append(folder)

    def last_undoable_run(self) -> OrganizeRun | None:
        for run in reversed(self._history):
            if not run.undone and run.moves:
                return run
        return None


# Single process-wide instance — fine for a local desktop-style utility
# with one active user session.
undo_manager = UndoManager()
