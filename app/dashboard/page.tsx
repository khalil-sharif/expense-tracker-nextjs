"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import TrendLineChart from "@/components/charts/TrendLineChart";
import CategoryDonutChart from "@/components/charts/CategoryDonutChart";
import MonthComparisonChart from "@/components/charts/MonthComparisonChart";
import { formatCurrency, formatDate, isSameMonth } from "@/lib/utils";

export default function DashboardPage() {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);

  const stats = useMemo(() => {
    const monthTx = transactions.filter((t) => isSameMonth(t.date));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
    return { income, expense, net: income - expense, netWorth };
  }, [transactions, accounts]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 6),
    [transactions]
  );

  const accountNameById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, a.name])),
    [accounts]
  );

  return (
    <div className="flex-1">
      <Header title="Dashboard" subtitle="Your financial overview at a glance" />

      <main className="space-y-6 px-4 py-6 md:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Net Worth"
            value={formatCurrency(stats.netWorth)}
            icon="🏦"
            tone="default"
          />
          <StatCard
            label="Income (This Month)"
            value={formatCurrency(stats.income)}
            icon="⬆️"
            tone="positive"
          />
          <StatCard
            label="Expenses (This Month)"
            value={formatCurrency(stats.expense)}
            icon="⬇️"
            tone="negative"
          />
          <StatCard
            label="Net (This Month)"
            value={formatCurrency(stats.net)}
            icon={stats.net >= 0 ? "✅" : "🔻"}
            tone={stats.net >= 0 ? "positive" : "negative"}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Income vs. Expense Trend (30 days)
            </h2>
            <TrendLineChart transactions={transactions} />
          </div>
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Spending by Category (This Month)
            </h2>
            <CategoryDonutChart transactions={transactions} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Month-over-Month Comparison
            </h2>
            <MonthComparisonChart transactions={transactions} />
          </div>
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Recent Transactions</h2>
            <ul className="divide-y divide-gray-100">
              {recentTransactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.category}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(t.date)} · {accountNameById[t.accountId] ?? "Unknown"}
                    </p>
                  </div>
                  <span
                    className={
                      t.type === "income"
                        ? "text-sm font-semibold text-income"
                        : "text-sm font-semibold text-expense"
                    }
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
              {recentTransactions.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">No transactions yet.</p>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
