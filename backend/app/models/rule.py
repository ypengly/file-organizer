"""Pydantic models for user-defined custom organization rules."""
from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel


class RuleConditionType(str, Enum):
    EXTENSION = "extension"
    FILENAME_CONTAINS = "filename_contains"
    CATEGORY = "category"
    SIZE_GREATER_THAN = "size_greater_than"


class Rule(BaseModel):
    id: str
    name: str
    condition_type: RuleConditionType
    condition_value: str
    target_folder: str
    enabled: bool = True
    priority: int = 0


class RuleCreate(BaseModel):
    name: str
    condition_type: RuleConditionType
    condition_value: str
    target_folder: str
    enabled: bool = True
    priority: Optional[int] = None


class RuleUpdate(BaseModel):
    name: Optional[str] = None
    condition_type: Optional[RuleConditionType] = None
    condition_value: Optional[str] = None
    target_folder: Optional[str] = None
    enabled: Optional[bool] = None
    priority: Optional[int] = None
