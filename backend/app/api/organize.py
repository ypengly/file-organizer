"""Preview, organize, undo, and statistics endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.file import (
    OrganizeRequest,
    OrganizeStats,
    PreviewRequest,
    PreviewResult,
    UndoResult,
)
from app.services import organizer
from app.utils.filesystem import UnsafePathError

router = APIRouter(tags=["organize"])

_LAST_STATS: OrganizeStats | None = None


@router.post("/api/preview", response_model=PreviewResult)
def preview(req: PreviewRequest) -> PreviewResult:
    try:
        return organizer.build_preview(req)
    except UnsafePathError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/api/organize", response_model=OrganizeStats)
def organize(req: OrganizeRequest) -> OrganizeStats:
    global _LAST_STATS
    try:
        stats = organizer.execute_organize(req.preview_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    _LAST_STATS = stats
    return stats


@router.post("/api/undo", response_model=UndoResult)
def undo() -> UndoResult:
    try:
        return organizer.undo_last()
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/api/statistics", response_model=OrganizeStats)
def statistics() -> OrganizeStats:
    if _LAST_STATS is None:
        raise HTTPException(status_code=404, detail="No organization run yet.")
    return _LAST_STATS
