"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

type SortKey = "date" | "amount" | "category";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

interface Props {
  onEdit: (t: Transaction) => void;
}

export default function TransactionTable({ onEdit }: Props) {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const deleteTransaction = useStore((s) => s.deleteTransaction);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const accountNameById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (!term) return true;
      const haystack = `${t.category} ${t.note} ${accountNameById[t.accountId] ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      if (sortKey === "amount") cmp = a.amount - b.amount;
      if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [transactions, search, typeFilter, sortKey, sortDir, accountNameById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  return (
    <div className="card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by category, note, or account..."
          className="input sm:max-w-xs"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <div className="flex gap-2">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setTypeFilter(f);
                setPage(1);
              }}
              className={
                typeFilter === f
                  ? "btn-primary px-3 py-1.5 text-xs capitalize"
                  : "btn-secondary px-3 py-1.5 text-xs capitalize"
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="cursor-pointer select-none py-2" onClick={() => toggleSort("date")}>
                Date{sortIndicator("date")}
              </th>
              <th
                className="cursor-pointer select-none py-2"
                onClick={() => toggleSort("category")}
              >
                Category{sortIndicator("category")}
              </th>
              <th className="py-2">Account</th>
              <th className="py-2">Note</th>
              <th
                className="cursor-pointer select-none py-2 text-right"
                onClick={() => toggleSort("amount")}
              >
                Amount{sortIndicator("amount")}
              </th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-gray-500">{formatDate(t.date)}</td>
                <td className="py-3 font-medium text-gray-800">{t.category}</td>
                <td className="py-3 text-gray-500">{accountNameById[t.accountId] ?? "—"}</td>
                <td className="max-w-[160px] truncate py-3 text-gray-400">{t.note || "—"}</td>
                <td
                  className={
                    t.type === "income"
                      ? "py-3 text-right font-semibold text-income"
                      : "py-3 text-right font-semibold text-expense"
                  }
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(t)}
                    className="mr-2 text-xs font-medium text-brand-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTransaction(t.id)}
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing {pageItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–
          {(currentPage - 1) * PAGE_SIZE + pageItems.length} of {filtered.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Prev
          </button>
          <span className="flex items-center px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
