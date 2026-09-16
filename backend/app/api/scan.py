"""Scan and folder-inspection endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.file import ScanRequest, ScanResult
from app.services.scanner import scan_folder
from app.utils.filesystem import UnsafePathError

router = APIRouter(tags=["scan"])


@router.post("/api/scan", response_model=ScanResult)
def scan(req: ScanRequest) -> ScanResult:
    try:
        return scan_folder(req.folder_path)
    except UnsafePathError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
