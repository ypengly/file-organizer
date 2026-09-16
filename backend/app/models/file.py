"""Pydantic models describing files, scan results, and operations."""
from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Category(str, Enum):
    IMAGES = "Images"
    DOCUMENTS = "Documents"
    VIDEOS = "Videos"
    AUDIO = "Audio"
    ARCHIVES = "Archives"
    CODE = "Code"
    OTHER = "Other"


class DateSource(str, Enum):
    MODIFIED = "modified"
    CREATED = "created"


class OrganizeMode(str, Enum):
    BY_TYPE = "by_type"
    BY_DATE = "by_date"
    CUSTOM_RULES = "custom_rules"


class DuplicateStrategy(str, Enum):
    RENAME = "rename"
    SKIP = "skip"
    ASK = "ask"
    REPLACE = "replace"


class FileEntry(BaseModel):
    name: str
    path: str
    extension: str
    size: int
    category: Category
    modified_at: float
    created_at: float


class ScanRequest(BaseModel):
    folder_path: str


class ScanResult(BaseModel):
    folder_path: str
    folder_name: str
    total_files: int
    total_size: int
    category_counts: dict[str, int]
    files: list[FileEntry]


class PreviewRequest(BaseModel):
    folder_path: str
    mode: OrganizeMode
    date_source: DateSource = DateSource.MODIFIED
    duplicate_strategy: DuplicateStrategy = DuplicateStrategy.RENAME
    rule_ids: Optional[list[str]] = None


class Operation(BaseModel):
    id: str
    source: str
    destination: str
    category: str
    size: int
    is_duplicate: bool = False
    will_skip: bool = False


class PreviewResult(BaseModel):
    preview_id: str
    total_files: int
    total_size: int
    operations: list[Operation]
    skipped: list[dict] = Field(default_factory=list)
    duplicates: int = 0


class OrganizeRequest(BaseModel):
    preview_id: str


class OrganizeStats(BaseModel):
    files_organized: int
    folders_created: int
    space_processed: int
    skipped_files: int
    duplicates: int
    time_seconds: float
    category_breakdown: dict[str, int]
    failed: list[dict] = Field(default_factory=list)


class UndoResult(BaseModel):
    restored_files: int
    failed: list[dict] = Field(default_factory=list)
