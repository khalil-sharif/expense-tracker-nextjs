export type TransactionType = "income" | "expense";

export type AccountType = "cash" | "bank" | "credit";

export type Category =
  | "Salary"
  | "Freelance"
  | "Groceries"
  | "Rent"
  | "Utilities"
  | "Dining Out"
  | "Transportation"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Subscriptions"
  | "Travel"
  | "Insurance"
  | "Savings"
  | "Other";

export const CATEGORIES: Category[] = [
  "Salary",
  "Freelance",
  "Groceries",
  "Rent",
  "Utilities",
  "Dining Out",
  "Transportation",
  "Entertainment",
  "Health",
  "Shopping",
  "Subscriptions",
  "Travel",
  "Insurance",
  "Savings",
  "Other",
];

export const EXPENSE_CATEGORIES: Category[] = CATEGORIES.filter(
  (c) => c !== "Salary" && c !== "Freelance"
);

export const INCOME_CATEGORIES: Category[] = ["Salary", "Freelance", "Other"];

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  accountId: string;
  date: string; // ISO date string
  note: string;
  recurringRuleId?: string;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  accountId: string;
  frequency: RecurringFrequency;
  note: string;
  startDate: string; // ISO date string
  lastGeneratedDate: string | null; // ISO date string of last generated occurrence
  active: boolean;
}

export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number;
}

export interface Notification {
  id: string;
  type: "budget-warning" | "budget-exceeded" | "recurring-generated";
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Transfer {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note: string;
}
