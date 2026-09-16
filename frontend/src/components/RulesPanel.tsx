import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Rule, RuleConditionType } from "../types";
import { Icon } from "./Icon";

const CONDITION_LABELS: Record<RuleConditionType, string> = {
  extension: "Extension equals",
  filename_contains: "Filename contains",
  category: "Category equals",
  size_greater_than: "Size greater than (bytes)",
};

export function RulesPanel({ onRulesChanged }: { onRulesChanged: () => void }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [conditionType, setConditionType] = useState<RuleConditionType>("extension");
  const [conditionValue, setConditionValue] = useState("");
  const [targetFolder, setTargetFolder] = useState("");

  async function load() {
    setRules(await api.rules.list());
  }

  useEffect(() => {
    load();
  }, []);

  async function addRule(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !conditionValue.trim() || !targetFolder.trim()) return;
    await api.rules.create({
      name: name.trim(),
      condition_type: conditionType,
      condition_value: conditionValue.trim(),
      target_folder: targetFolder.trim(),
    });
    setName("");
    setConditionValue("");
    setTargetFolder("");
    setShowForm(false);
    await load();
    onRulesChanged();
  }

  async function toggleRule(rule: Rule) {
    await api.rules.update(rule.id, { enabled: !rule.enabled });
    await load();
    onRulesChanged();
  }

  async function deleteRule(id: string) {
    await api.rules.remove(id);
    await load();
    onRulesChanged();
  }

  async function moveRule(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rules.length) return;
    const a = rules[index];
    const b = rules[target];
    await api.rules.update(a.id, { priority: b.priority });
    await api.rules.update(b.id, { priority: a.priority });
    await load();
    onRulesChanged();
  }

  return (
    <div className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-ink dark:text-ink-dark">
            Custom rules
          </span>
          <p className="mt-0.5 text-xs text-muted dark:text-muted-dark">
            Evaluated top to bottom. First match wins; unmatched files fall
            back to category folders.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-md border border-border dark:border-border-dark px-2.5 py-1.5 text-xs font-medium text-ink dark:text-ink-dark hover:border-accent hover:text-accent"
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
          Add rule
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={addRule}
          className="mb-4 space-y-2 rounded-md bg-bg dark:bg-bg-dark p-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name (e.g. Invoices)"
            className="w-full rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2.5 py-1.5 text-sm text-ink dark:text-ink-dark focus:border-accent focus:outline-none"
          />
          <div className="flex gap-2">
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value as RuleConditionType)}
              className="rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2 py-1.5 text-sm text-ink dark:text-ink-dark focus:border-accent focus:outline-none"
            >
              {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              placeholder="value, e.g. .pdf or invoice"
              className="flex-1 rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2.5 py-1.5 text-sm text-ink dark:text-ink-dark focus:border-accent focus:outline-none"
            />
          </div>
          <input
            value={targetFolder}
            onChange={(e) => setTargetFolder(e.target.value)}
            placeholder="Move to folder, e.g. Invoices"
            className="w-full rounded-sm border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-2.5 py-1.5 text-sm text-ink dark:text-ink-dark focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-sm bg-accent py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Save rule
          </button>
        </form>
      )}

      {rules.length === 0 ? (
        <div className="rounded-md border border-dashed border-border dark:border-border-dark py-6 text-center text-sm text-muted dark:text-muted-dark">
          No rules yet. Files will be organized by category.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {rules.map((rule, i) => (
            <li
              key={rule.id}
              className="flex items-center gap-2 rounded-md border border-border dark:border-border-dark px-3 py-2"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveRule(i, -1)}
                  disabled={i === 0}
                  className="text-muted hover:text-ink disabled:opacity-20 dark:hover:text-ink-dark"
                  aria-label="Move up"
                >
                  <Icon name="chevron-right" className="h-3 w-3 -rotate-90" />
                </button>
                <button
                  onClick={() => moveRule(i, 1)}
                  disabled={i === rules.length - 1}
                  className="text-muted hover:text-ink disabled:opacity-20 dark:hover:text-ink-dark"
                  aria-label="Move down"
                >
                  <Icon name="chevron-right" className="h-3 w-3 rotate-90" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink dark:text-ink-dark">
                  {rule.name}
                </div>
                <div className="truncate font-mono text-xs text-muted dark:text-muted-dark">
                  {CONDITION_LABELS[rule.condition_type]} "{rule.condition_value}" → {rule.target_folder}/
                </div>
              </div>
              <button
                onClick={() => toggleRule(rule)}
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  rule.enabled
                    ? "bg-accent/10 text-accent"
                    : "bg-muted/10 text-muted"
                }`}
              >
                {rule.enabled ? "On" : "Off"}
              </button>
              <button
                onClick={() => deleteRule(rule.id)}
                className="shrink-0 text-muted hover:text-red-500"
                aria-label="Delete rule"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
