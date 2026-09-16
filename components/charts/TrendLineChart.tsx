"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
  days?: number;
}

function buildDailySeries(transactions: Transaction[], days: number) {
  const series: { date: string; label: string; income: number; expense: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    series.push({
      date: iso,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      income: 0,
      expense: 0,
    });
  }

  const byDate = new Map(series.map((s) => [s.date, s]));
  transactions.forEach((t) => {
    const entry = byDate.get(t.date);
    if (!entry) return;
    if (t.type === "income") entry.income += t.amount;
    else entry.expense += t.amount;
  });

  return series;
}

export default function TrendLineChart({ transactions, days = 30 }: Props) {
  const data = buildDailySeries(transactions, days);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f6" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          interval={Math.floor(days / 6)}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
          name="Expense"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
