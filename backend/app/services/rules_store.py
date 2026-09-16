"""In-memory store for user-defined custom organization rules."""
from __future__ import annotations

import uuid

from app.models.rule import Rule, RuleCreate, RuleUpdate


class RulesStore:
    def __init__(self) -> None:
        self._rules: dict[str, Rule] = {}

    def list(self) -> list[Rule]:
        return sorted(self._rules.values(), key=lambda r: r.priority)

    def get(self, rule_id: str) -> Rule | None:
        return self._rules.get(rule_id)

    def create(self, payload: RuleCreate) -> Rule:
        rule_id = uuid.uuid4().hex[:8]
        priority = payload.priority
        if priority is None:
            priority = (max((r.priority for r in self._rules.values()), default=-1) + 1)
        rule = Rule(
            id=rule_id,
            name=payload.name,
            condition_type=payload.condition_type,
            condition_value=payload.condition_value,
            target_folder=payload.target_folder,
            enabled=payload.enabled,
            priority=priority,
        )
        self._rules[rule_id] = rule
        return rule

    def update(self, rule_id: str, payload: RuleUpdate) -> Rule | None:
        existing = self._rules.get(rule_id)
        if existing is None:
            return None
        data = existing.model_dump()
        updates = payload.model_dump(exclude_unset=True)
        data.update(updates)
        updated = Rule(**data)
        self._rules[rule_id] = updated
        return updated

    def delete(self, rule_id: str) -> bool:
        return self._rules.pop(rule_id, None) is not None


rules_store = RulesStore()
