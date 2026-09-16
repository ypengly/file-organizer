"""Decides what happens when a proposed destination already exists."""
from __future__ import annotations

from pathlib import Path

from app.models.file import DuplicateStrategy
from app.utils.filesystem import unique_destination


class DuplicateDecision:
    def __init__(self, destination: Path, is_duplicate: bool, will_skip: bool):
        self.destination = destination
        self.is_duplicate = is_duplicate
        self.will_skip = will_skip


def resolve_duplicate(
    destination: Path, strategy: DuplicateStrategy
) -> DuplicateDecision:
    if not destination.exists():
        return DuplicateDecision(destination, is_duplicate=False, will_skip=False)

    if strategy == DuplicateStrategy.RENAME:
        return DuplicateDecision(
            unique_destination(destination), is_duplicate=True, will_skip=False
        )
    if strategy == DuplicateStrategy.SKIP:
        return DuplicateDecision(destination, is_duplicate=True, will_skip=True)
    if strategy == DuplicateStrategy.REPLACE:
        # Still flagged as a duplicate so the UI can show it; the caller
        # is responsible for requiring explicit confirmation before a
        # REPLACE strategy is ever passed to organize().
        return DuplicateDecision(destination, is_duplicate=True, will_skip=False)
    # ASK: surface it to the frontend and don't move it until the user
    # picks a resolution for this specific file.
    return DuplicateDecision(destination, is_duplicate=True, will_skip=True)
