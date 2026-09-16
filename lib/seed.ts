import { Account, Budget, RecurringRule, Transaction } from "./types";
import { todayISO, uid } from "./utils";

const cashId = "acc-cash";
const bankId = "acc-bank";
const creditId = "acc-credit";

export const seedAccounts: Account[] = [
  {
    id: cashId,
    name: "Cash Wallet",
    type: "cash",
    balance: 240,
    createdAt: "2026-01-01",
  },
  {
    id: bankId,
    name: "Checking Account",
    type: "bank",
    balance: 3200,
    createdAt: "2026-01-01",
  },
  {
    id: creditId,
    name: "Rewards Credit Card",
    type: "credit",
    balance: -540,
    createdAt: "2026-01-01",
  },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const seedTransactions: Transaction[] = [
  { id: uid(), type: "income", amount: 4200, category: "Salary", accountId: bankId, date: daysAgo(28), note: "Monthly salary" },
  { id: uid(), type: "expense", amount: 1200, category: "Rent", accountId: bankId, date: daysAgo(27), note: "September rent" },
  { id: uid(), type: "expense", amount: 86.32, category: "Groceries", accountId: bankId, date: daysAgo(25), note: "Weekly groceries" },
  { id: uid(), type: "expense", amount: 45.0, category: "Utilities", accountId: bankId, date: daysAgo(24), note: "Electricity bill" },
  { id: uid(), type: "expense", amount: 32.5, category: "Dining Out", accountId: creditId, date: daysAgo(20), note: "Dinner with friends" },
  { id: uid(), type: "expense", amount: 15.99, category: "Subscriptions", accountId: creditId, date: daysAgo(19), note: "Streaming service" },
  { id: uid(), type: "expense", amount: 60.0, category: "Transportation", accountId: cashId, date: daysAgo(18), note: "Gas" },
  { id: uid(), type: "income", amount: 650, category: "Freelance", accountId: bankId, date: daysAgo(15), note: "Design contract" },
  { id: uid(), type: "expense", amount: 120.75, category: "Shopping", accountId: creditId, date: daysAgo(14), note: "New shoes" },
  { id: uid(), type: "expense", amount: 78.4, category: "Groceries", accountId: bankId, date: daysAgo(11), note: "Groceries" },
  { id: uid(), type: "expense", amount: 25.0, category: "Entertainment", accountId: cashId, date: daysAgo(9), note: "Movie night" },
  { id: uid(), type: "expense", amount: 200.0, category: "Health", accountId: bankId, date: daysAgo(7), note: "Dental checkup" },
  { id: uid(), type: "expense", amount: 54.2, category: "Dining Out", accountId: creditId, date: daysAgo(5), note: "Lunch out" },
  { id: uid(), type: "expense", amount: 42.1, category: "Groceries", accountId: bankId, date: daysAgo(3), note: "Groceries" },
  { id: uid(), type: "expense", amount: 99.0, category: "Insurance", accountId: bankId, date: daysAgo(2), note: "Car insurance" },
];

export const seedBudgets: Budget[] = [
  { id: uid(), category: "Groceries", monthlyLimit: 400 },
  { id: uid(), category: "Dining Out", monthlyLimit: 150 },
  { id: uid(), category: "Entertainment", monthlyLimit: 100 },
  { id: uid(), category: "Transportation", monthlyLimit: 150 },
  { id: uid(), category: "Shopping", monthlyLimit: 200 },
  { id: uid(), category: "Subscriptions", monthlyLimit: 50 },
];

function monthsAgoDate(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

export const seedRecurringRules: RecurringRule[] = [
  {
    id: uid(),
    type: "expense",
    amount: 15.99,
    category: "Subscriptions",
    accountId: creditId,
    frequency: "monthly",
    note: "Streaming subscription",
    startDate: monthsAgoDate(3),
    lastGeneratedDate: null,
    active: true,
  },
  {
    id: uid(),
    type: "income",
    amount: 4200,
    category: "Salary",
    accountId: bankId,
    frequency: "monthly",
    note: "Monthly salary",
    startDate: monthsAgoDate(2),
    lastGeneratedDate: null,
    active: true,
  },
  {
    id: uid(),
    type: "expense",
    amount: 12.5,
    category: "Transportation",
    accountId: cashId,
    frequency: "weekly",
    note: "Transit pass",
    startDate: daysAgo(21),
    lastGeneratedDate: null,
    active: true,
  },
];

export { todayISO };
