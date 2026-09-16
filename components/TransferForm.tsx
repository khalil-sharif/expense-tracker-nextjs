"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { todayISO } from "@/lib/utils";
import Modal from "./Modal";

interface Props {
  onClose: () => void;
}

export default function TransferForm({ onClose }: Props) {
  const accounts = useStore((s) => s.accounts);
  const transferBetweenAccounts = useStore((s) => s.transferBetweenAccounts);

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (fromAccountId === toAccountId) {
      setError("Choose two different accounts.");
      return;
    }

    transferBetweenAccounts({
      fromAccountId,
      toAccountId,
      amount: amountNum,
      date,
      note,
    });
    onClose();
  }

  return (
    <Modal title="Transfer Between Accounts" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="from-account">
            From
          </label>
          <select
            id="from-account"
            className="input"
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="to-account">
            To
          </label>
          <select
            id="to-account"
            className="input"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="transfer-amount">
            Amount
          </label>
          <input
            id="transfer-amount"
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
          <label className="label" htmlFor="transfer-date">
            Date
          </label>
          <input
            id="transfer-date"
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="transfer-note">
            Note
          </label>
          <input
            id="transfer-note"
            type="text"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Transfer
          </button>
        </div>
      </form>
    </Modal>
  );
}
