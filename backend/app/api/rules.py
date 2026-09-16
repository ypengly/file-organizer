"""CRUD endpoints for custom organization rules."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.rule import Rule, RuleCreate, RuleUpdate
from app.services.rules_store import rules_store

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("", response_model=list[Rule])
def list_rules() -> list[Rule]:
    return rules_store.list()


@router.post("", response_model=Rule)
def create_rule(payload: RuleCreate) -> Rule:
    return rules_store.create(payload)


@router.patch("/{rule_id}", response_model=Rule)
def update_rule(rule_id: str, payload: RuleUpdate) -> Rule:
    updated = rules_store.update(rule_id, payload)
    if updated is None:
        raise HTTPException(status_code=404, detail="Rule not found.")
    return updated


@router.delete("/{rule_id}")
def delete_rule(rule_id: str) -> dict:
    deleted = rules_store.delete(rule_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Rule not found.")
    return {"deleted": True}
