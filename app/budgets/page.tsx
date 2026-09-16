"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import BudgetCard from "@/components/BudgetCard";
import BudgetForm from "@/components/BudgetForm";
import RecurringRuleForm from "@/components/RecurringRuleForm";
import RecurringRuleList from "@/components/RecurringRuleList";
import { Budget } from "@/lib/types";

export default function BudgetsPage() {
  const budgets = useStore((s) => s.budgets);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);

  function openAddBudget() {
    setEditingBudget(null);
    setShowBudgetForm(true);
  }

  function openEditBudget(b: Budget) {
    setEditingBudget(b);
    setShowBudgetForm(true);
  }

  function closeBudgetForm() {
    setShowBudgetForm(false);
    setEditingBudget(null);
  }

  return (
    <div className="flex-1">
      <Header title="Budgets" subtitle="Set monthly limits per category and manage recurring rules" />

      <main className="space-y-8 px-4 py-6 md:px-8">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Monthly Budgets</h2>
            <button type="button" onClick={openAddBudget} className="btn-primary text-xs">
              + Add Budget
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} onEdit={openEditBudget} />
            ))}
            {budgets.length === 0 && (
              <p className="col-span-full text-center text-sm text-gray-400">
                No budgets yet. Add one to start tracking spending limits.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recurring Rules</h2>
            <button type="button" onClick={() => setShowRuleForm(true)} className="btn-primary text-xs">
              + New Rule
            </button>
          </div>
          <RecurringRuleList />
        </section>
      </main>

      {showBudgetForm && <BudgetForm onClose={closeBudgetForm} editing={editingBudget} />}
      {showRuleForm && <RecurringRuleForm onClose={() => setShowRuleForm(false)} />}
    </div>
  );
}
