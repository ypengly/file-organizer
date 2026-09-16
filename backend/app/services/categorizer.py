"""Maps file extensions to categories."""
from __future__ import annotations

from app.models.file import Category

EXTENSION_MAP: dict[str, Category] = {}

_CATEGORY_EXTENSIONS: dict[Category, list[str]] = {
    Category.IMAGES: [
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".tiff",
        ".heic", ".ico", ".raw",
    ],
    Category.DOCUMENTS: [
        ".pdf", ".doc", ".docx", ".txt", ".xlsx", ".xls", ".pptx", ".ppt",
        ".csv", ".rtf", ".odt", ".md", ".pages", ".key", ".numbers",
    ],
    Category.VIDEOS: [
        ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v",
    ],
    Category.AUDIO: [
        ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma",
    ],
    Category.ARCHIVES: [
        ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".iso",
    ],
    Category.CODE: [
        ".py", ".js", ".ts", ".tsx", ".jsx", ".cpp", ".c", ".java", ".go",
        ".rs", ".rb", ".php", ".html", ".css", ".json", ".yaml", ".yml",
        ".sh", ".sql",
    ],
}

for _category, _extensions in _CATEGORY_EXTENSIONS.items():
    for _ext in _extensions:
        EXTENSION_MAP[_ext] = _category


def categorize(extension: str) -> Category:
    return EXTENSION_MAP.get(extension.lower(), Category.OTHER)


def all_categories_with_extensions() -> dict[str, list[str]]:
    return {cat.value: exts for cat, exts in _CATEGORY_EXTENSIONS.items()}
