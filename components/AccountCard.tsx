"use client";

import { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useStore } from "@/store/useStore";

const ICONS: Record<Account["type"], string> = {
  cash: "💵",
  bank: "🏛️",
  credit: "💳",
};

interface Props {
  account: Account;
  onEdit: (a: Account) => void;
}

export default function AccountCard({ account, onEdit }: Props) {
  const deleteAccount = useStore((s) => s.deleteAccount);

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-lg">
            {ICONS[account.type]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{account.name}</p>
            <p className="text-xs capitalize text-gray-400">{account.type} account</p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="font-medium text-brand-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${account.name}"? This also removes its transactions.`)) {
                deleteAccount(account.id);
              }
            }}
            className="font-medium text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
      <p
        className={
          account.balance < 0
            ? "mt-4 text-2xl font-bold text-expense"
            : "mt-4 text-2xl font-bold text-gray-900"
        }
      >
        {formatCurrency(account.balance)}
      </p>
      <p className="mt-1 text-xs text-gray-400">Current balance</p>
    </div>
  );
}
