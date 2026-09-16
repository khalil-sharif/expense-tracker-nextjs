"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Budget } from "@/lib/types";
import { clamp, formatCurrency, isSameMonth } from "@/lib/utils";

interface Props {
  budget: Budget;
  onEdit: (b: Budget) => void;
}

export default function BudgetCard({ budget, onEdit }: Props) {
  const transactions = useStore((s) => s.transactions);
  const deleteBudget = useStore((s) => s.deleteBudget);

  const spent = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === budget.category && isSameMonth(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, budget.category]);

  const ratio = budget.monthlyLimit > 0 ? spent / budget.monthlyLimit : 0;
  const pct = clamp(ratio * 100, 0, 100);
  const isOver = spent > budget.monthlyLimit;
  const isWarning = !isOver && ratio >= 0.9;

  const barColor = isOver ? "bg-expense" : isWarning ? "bg-amber-500" : "bg-brand-500";

  return (
    <div className="card">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{budget.category}</p>
          <p className="text-xs text-gray-400">
            {formatCurrency(spent)} of {formatCurrency(budget.monthlyLimit)}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="font-medium text-brand-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteBudget(budget.id)}
            className="font-medium text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-gray-400">{Math.round(ratio * 100)}% used</span>
        {isOver && <span className="font-medium text-expense">Over budget</span>}
        {isWarning && <span className="font-medium text-amber-600">Near limit</span>}
      </div>
    </div>
  );
}
