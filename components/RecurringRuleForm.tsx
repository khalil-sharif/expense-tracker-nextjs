"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import {
  Category,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  RecurringFrequency,
  TransactionType,
} from "@/lib/types";
import { todayISO } from "@/lib/utils";
import Modal from "./Modal";

interface Props {
  onClose: () => void;
}

const FREQUENCIES: RecurringFrequency[] = ["daily", "weekly", "monthly", "yearly"];

export default function RecurringRuleForm({ onClose }: Props) {
  const accounts = useStore((s) => s.accounts);
  const addRecurringRule = useStore((s) => s.addRecurringRule);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Subscriptions");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [startDate, setStartDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    const list = next === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!list.includes(category)) setCategory(list[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (!accountId) {
      setError("Select an account.");
      return;
    }

    addRecurringRule({
      type,
      amount: amountNum,
      category,
      accountId,
      frequency,
      startDate,
      note,
      active: true,
    });
    onClose();
  }

  return (
    <Modal title="New Recurring Rule" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={
              type === "expense"
                ? "btn bg-red-50 text-red-600 ring-1 ring-red-200"
                : "btn bg-gray-50 text-gray-500"
            }
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={
              type === "income"
                ? "btn bg-green-50 text-income ring-1 ring-green-200"
                : "btn bg-gray-50 text-gray-500"
            }
          >
            Income
          </button>
        </div>

        <div>
          <label className="label" htmlFor="rule-amount">
            Amount
          </label>
          <input
            id="rule-amount"
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="rule-category">
            Category
          </label>
          <select
            id="rule-category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="rule-account">
            Account
          </label>
          <select
            id="rule-account"
            className="input"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="rule-frequency">
            Frequency
          </label>
          <select
            id="rule-frequency"
            className="input"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="rule-start">
            Start Date
          </label>
          <input
            id="rule-start"
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="rule-note">
            Note
          </label>
          <input
            id="rule-note"
            type="text"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Netflix subscription"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="rounded-lg bg-brand-50 p-3 text-xs text-brand-700">
          Occurrences from the start date up to today will be generated immediately, and future
          occurrences will keep auto-generating each time you open the app.
        </p>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Create Rule
          </button>
        </div>
      </form>
    </Modal>
  );
}
