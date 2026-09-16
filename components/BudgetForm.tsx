"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Budget, Category, EXPENSE_CATEGORIES } from "@/lib/types";
import Modal from "./Modal";

interface Props {
  onClose: () => void;
  editing?: Budget | null;
}

export default function BudgetForm({ onClose, editing }: Props) {
  const budgets = useStore((s) => s.budgets);
  const addBudget = useStore((s) => s.addBudget);
  const updateBudget = useStore((s) => s.updateBudget);

  const existingCategories = new Set(budgets.map((b) => b.category));
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => c === editing?.category || !existingCategories.has(c)
  );

  const [category, setCategory] = useState<Category>(
    editing?.category ?? availableCategories[0] ?? "Groceries"
  );
  const [monthlyLimit, setMonthlyLimit] = useState(
    editing ? String(editing.monthlyLimit) : ""
  );
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const limitNum = parseFloat(monthlyLimit);
    if (Number.isNaN(limitNum) || limitNum <= 0) {
      setError("Enter a valid monthly limit greater than 0.");
      return;
    }

    if (editing) {
      updateBudget(editing.id, { category, monthlyLimit: limitNum });
    } else {
      addBudget({ category, monthlyLimit: limitNum });
    }
    onClose();
  }

  return (
    <Modal title={editing ? "Edit Budget" : "Add Budget"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="budget-category">
            Category
          </label>
          <select
            id="budget-category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={availableCategories.length === 0}
          >
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {availableCategories.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Every expense category already has a budget.
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="monthly-limit">
            Monthly Limit
          </label>
          <input
            id="monthly-limit"
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
            disabled={availableCategories.length === 0}
          >
            {editing ? "Save Changes" : "Add Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
