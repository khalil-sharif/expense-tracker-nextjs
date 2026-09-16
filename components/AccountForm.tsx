"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Account, AccountType } from "@/lib/types";
import Modal from "./Modal";

interface Props {
  onClose: () => void;
  editing?: Account | null;
}

const TYPES: AccountType[] = ["cash", "bank", "credit"];

export default function AccountForm({ onClose, editing }: Props) {
  const addAccount = useStore((s) => s.addAccount);
  const updateAccount = useStore((s) => s.updateAccount);

  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<AccountType>(editing?.type ?? "cash");
  const [balance, setBalance] = useState(editing ? String(editing.balance) : "0");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter an account name.");
      return;
    }
    const balanceNum = parseFloat(balance);
    if (Number.isNaN(balanceNum)) {
      setError("Enter a valid starting balance.");
      return;
    }

    if (editing) {
      updateAccount(editing.id, { name: name.trim(), type, balance: balanceNum });
    } else {
      addAccount({ name: name.trim(), type, balance: balanceNum });
    }
    onClose();
  }

  return (
    <Modal title={editing ? "Edit Account" : "Add Account"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="account-name">
            Account Name
          </label>
          <input
            id="account-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chase Checking"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="account-type">
            Type
          </label>
          <select
            id="account-type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="account-balance">
            {editing ? "Balance" : "Starting Balance"}
          </label>
          <input
            id="account-balance"
            type="number"
            step="0.01"
            className="input"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            {editing ? "Save Changes" : "Add Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
