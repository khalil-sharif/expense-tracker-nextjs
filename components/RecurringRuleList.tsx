"use client";

import { useStore } from "@/store/useStore";
import { nextOccurrenceDate } from "@/lib/recurring";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function RecurringRuleList() {
  const recurringRules = useStore((s) => s.recurringRules);
  const accounts = useStore((s) => s.accounts);
  const toggleRecurringRule = useStore((s) => s.toggleRecurringRule);
  const deleteRecurringRule = useStore((s) => s.deleteRecurringRule);

  const accountNameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

  if (recurringRules.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-sm text-gray-400">
          No recurring rules yet. Create one to auto-generate transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recurringRules.map((rule) => (
        <div
          key={rule.id}
          className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">{rule.category}</p>
              <span
                className={
                  rule.type === "income"
                    ? "rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-income"
                    : "rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-expense"
                }
              >
                {rule.type}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-500">
                {rule.frequency}
              </span>
              {!rule.active && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                  paused
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {formatCurrency(rule.amount)} · {accountNameById[rule.accountId] ?? "—"} · next{" "}
              {formatDate(nextOccurrenceDate(rule))}
              {rule.note ? ` · ${rule.note}` : ""}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => toggleRecurringRule(rule.id)}
              className="btn-secondary px-3 py-1.5"
            >
              {rule.active ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => deleteRecurringRule(rule.id)}
              className="btn-danger px-3 py-1.5"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
