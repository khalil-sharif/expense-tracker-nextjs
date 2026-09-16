"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Account,
  Budget,
  Notification,
  RecurringRule,
  Transaction,
  Transfer,
} from "@/lib/types";
import { seedAccounts, seedBudgets, seedRecurringRules, seedTransactions } from "@/lib/seed";
import { generateOccurrences } from "@/lib/recurring";
import { isSameMonth, todayISO, uid } from "@/lib/utils";

function applyTransactionToBalance(accounts: Account[], t: Transaction, sign: 1 | -1): Account[] {
  return accounts.map((a) => {
    if (a.id !== t.accountId) return a;
    const delta = t.type === "income" ? t.amount : -t.amount;
    return { ...a, balance: a.balance + sign * delta };
  });
}

interface StoreState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringRules: RecurringRule[];
  notifications: Notification[];
  hasHydratedRecurring: boolean;

  // transactions
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id">>) => void;
  deleteTransaction: (id: string) => void;

  // accounts
  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, updates: Partial<Omit<Account, "id">>) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (transfer: Transfer) => void;

  // budgets
  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, updates: Partial<Omit<Budget, "id">>) => void;
  deleteBudget: (id: string) => void;

  // recurring rules
  addRecurringRule: (r: Omit<RecurringRule, "id" | "lastGeneratedDate">) => void;
  updateRecurringRule: (id: string, updates: Partial<Omit<RecurringRule, "id">>) => void;
  deleteRecurringRule: (id: string) => void;
  toggleRecurringRule: (id: string) => void;

  // notifications
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // lifecycle
  processDueRecurringRules: () => void;
  checkBudgetAlerts: () => void;
  importTransactions: (transactions: Transaction[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      accounts: seedAccounts,
      transactions: seedTransactions,
      budgets: seedBudgets,
      recurringRules: seedRecurringRules,
      notifications: [],
      hasHydratedRecurring: false,

      addTransaction: (t) => {
        const newTransaction: Transaction = { ...t, id: uid() };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          accounts: applyTransactionToBalance(state.accounts, newTransaction, 1),
        }));
        get().checkBudgetAlerts();
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const existing = state.transactions.find((t) => t.id === id);
          if (!existing) return state;
          let accounts = applyTransactionToBalance(state.accounts, existing, -1);
          const updated: Transaction = { ...existing, ...updates };
          accounts = applyTransactionToBalance(accounts, updated, 1);
          return {
            transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
            accounts,
          };
        });
        get().checkBudgetAlerts();
      },

      deleteTransaction: (id) => {
        set((state) => {
          const existing = state.transactions.find((t) => t.id === id);
          if (!existing) return state;
          const accounts = applyTransactionToBalance(state.accounts, existing, -1);
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts,
          };
        });
      },

      addAccount: (a) => {
        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...a, id: uid(), createdAt: todayISO() },
          ],
        }));
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          transactions: state.transactions.filter((t) => t.accountId !== id),
        }));
      },

      transferBetweenAccounts: (transfer) => {
        set((state) => {
          const fromName =
            state.accounts.find((a) => a.id === transfer.fromAccountId)?.name ?? "account";
          const toName =
            state.accounts.find((a) => a.id === transfer.toAccountId)?.name ?? "account";
          return {
            accounts: state.accounts.map((a) => {
              if (a.id === transfer.fromAccountId) {
                return { ...a, balance: a.balance - transfer.amount };
              }
              if (a.id === transfer.toAccountId) {
                return { ...a, balance: a.balance + transfer.amount };
              }
              return a;
            }),
            transactions: [
              {
                id: uid(),
                type: "expense",
                amount: transfer.amount,
                category: "Other",
                accountId: transfer.fromAccountId,
                date: transfer.date,
                note: `Transfer to ${toName}${transfer.note ? `: ${transfer.note}` : ""}`,
              },
              {
                id: uid(),
                type: "income",
                amount: transfer.amount,
                category: "Other",
                accountId: transfer.toAccountId,
                date: transfer.date,
                note: `Transfer from ${fromName}${transfer.note ? `: ${transfer.note}` : ""}`,
              },
              ...state.transactions,
            ],
          };
        });
      },

      addBudget: (b) => {
        set((state) => ({ budgets: [...state.budgets, { ...b, id: uid() }] }));
      },

      updateBudget: (id, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
      },

      addRecurringRule: (r) => {
        set((state) => ({
          recurringRules: [
            ...state.recurringRules,
            { ...r, id: uid(), lastGeneratedDate: null },
          ],
        }));
        get().processDueRecurringRules();
      },

      updateRecurringRule: (id, updates) => {
        set((state) => ({
          recurringRules: state.recurringRules.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecurringRule: (id) => {
        set((state) => ({
          recurringRules: state.recurringRules.filter((r) => r.id !== id),
        }));
      },

      toggleRecurringRule: (id) => {
        set((state) => ({
          recurringRules: state.recurringRules.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r
          ),
        }));
      },

      addNotification: (n) => {
        set((state) => ({
          notifications: [
            {
              ...n,
              id: uid(),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50),
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      processDueRecurringRules: () => {
        const today = todayISO();
        const state = get();
        let allNewTransactions: Transaction[] = [];
        let accounts = state.accounts;
        let generatedCount = 0;

        const updatedRules = state.recurringRules.map((rule) => {
          const { transactions: occurrences, lastGeneratedDate } = generateOccurrences(
            rule,
            today
          );
          if (occurrences.length === 0) return rule;
          generatedCount += occurrences.length;
          allNewTransactions = [...allNewTransactions, ...occurrences];
          occurrences.forEach((t) => {
            accounts = applyTransactionToBalance(accounts, t, 1);
          });
          return { ...rule, lastGeneratedDate };
        });

        if (allNewTransactions.length > 0) {
          set({
            recurringRules: updatedRules,
            transactions: [...allNewTransactions, ...state.transactions],
            accounts,
          });
          get().addNotification({
            type: "recurring-generated",
            message: `${generatedCount} recurring transaction${
              generatedCount === 1 ? "" : "s"
            } auto-generated.`,
          });
        }

        set({ hasHydratedRecurring: true });
        get().checkBudgetAlerts();
      },

      checkBudgetAlerts: () => {
        const state = get();
        const now = new Date();
        state.budgets.forEach((budget) => {
          const spent = state.transactions
            .filter(
              (t) =>
                t.type === "expense" &&
                t.category === budget.category &&
                isSameMonth(t.date, now)
            )
            .reduce((sum, t) => sum + t.amount, 0);

          const ratio = budget.monthlyLimit > 0 ? spent / budget.monthlyLimit : 0;
          const alreadyNotified = state.notifications.some(
            (n) =>
              n.message.includes(budget.category) &&
              new Date(n.createdAt).getMonth() === now.getMonth()
          );
          if (alreadyNotified) return;

          if (ratio >= 1) {
            get().addNotification({
              type: "budget-exceeded",
              message: `You've exceeded your ${budget.category} budget this month.`,
            });
          } else if (ratio >= 0.9) {
            get().addNotification({
              type: "budget-warning",
              message: `You're at ${Math.round(ratio * 100)}% of your ${budget.category} budget.`,
            });
          }
        });
      },

      importTransactions: (transactions) => {
        set((state) => {
          let accounts = state.accounts;
          transactions.forEach((t) => {
            accounts = applyTransactionToBalance(accounts, t, 1);
          });
          return {
            transactions: [...transactions, ...state.transactions],
            accounts,
          };
        });
        get().checkBudgetAlerts();
      },
    }),
    {
      name: "expense-tracker-storage",
      version: 1,
    }
  )
);
