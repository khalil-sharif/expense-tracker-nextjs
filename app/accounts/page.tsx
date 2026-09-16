"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import AccountCard from "@/components/AccountCard";
import AccountForm from "@/components/AccountForm";
import TransferForm from "@/components/TransferForm";
import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function AccountsPage() {
  const accounts = useStore((s) => s.accounts);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  function openAdd() {
    setEditingAccount(null);
    setShowAccountForm(true);
  }

  function openEdit(a: Account) {
    setEditingAccount(a);
    setShowAccountForm(true);
  }

  function closeForm() {
    setShowAccountForm(false);
    setEditingAccount(null);
  }

  return (
    <div className="flex-1">
      <Header title="Accounts" subtitle="Manage balances and transfer funds between accounts" />

      <main className="space-y-6 px-4 py-6 md:px-8">
        <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowTransferForm(true)}
              className="btn-secondary"
              disabled={accounts.length < 2}
            >
              🔁 Transfer
            </button>
            <button type="button" onClick={openAdd} className="btn-primary">
              + Add Account
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} onEdit={openEdit} />
          ))}
          {accounts.length === 0 && (
            <p className="col-span-full text-center text-sm text-gray-400">
              No accounts yet. Add one to start tracking balances.
            </p>
          )}
        </div>
      </main>

      {showAccountForm && <AccountForm onClose={closeForm} editing={editingAccount} />}
      {showTransferForm && <TransferForm onClose={() => setShowTransferForm(false)} />}
    </div>
  );
}
