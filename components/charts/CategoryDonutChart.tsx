"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Transaction } from "@/lib/types";
import { formatCurrency, isSameMonth } from "@/lib/utils";

const COLORS = [
  "#2456f5",
  "#dc2626",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#0891b2",
  "#ec4899",
  "#65a30d",
  "#ea580c",
  "#0284c7",
  "#7c3aed",
  "#be123c",
  "#059669",
  "#ca8a04",
  "#475569",
];

interface Props {
  transactions: Transaction[];
}

export default function CategoryDonutChart({ transactions }: Props) {
  const expensesThisMonth = transactions.filter(
    (t) => t.type === "expense" && isSameMonth(t.date)
  );

  const byCategory = new Map<string, number>();
  expensesThisMonth.forEach((t) => {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  });

  const data = Array.from(byCategory.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
        No expenses recorded this month yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12, lineHeight: "20px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
