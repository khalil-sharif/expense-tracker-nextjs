# Expense Tracker (Next.js)

A complete, client-side personal finance tracker built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, Zustand, TanStack Query, and Recharts. All
data lives in the browser (`localStorage`) — there is no backend, database,
or server API.

## Features

- **Transaction CRUD** — add, edit, and delete income/expense entries
  (amount, category, account, date, note) with a searchable, sortable,
  paginated table.
- **Categorized budgets** — set a monthly limit per expense category, see a
  live progress bar (spent vs. limit), and get a visual "over budget" /
  "near limit" state.
- **Recurring transaction rules** — define a rule (frequency, amount,
  category, account) and the app auto-generates every missed occurrence up
  to today whenever it loads.
- **Multi-account support** — cash / bank / credit accounts, each with a
  running balance, plus a transfer action that moves money between two
  accounts.
- **Analytics dashboard** — Recharts income/expense trend line (30 days),
  category breakdown donut chart (this month), and a month-over-month
  comparison bar chart (6 months).
- **CSV import/export** — export all transactions to a CSV file, or import
  transactions from a CSV file, entirely client-side (no backend).
- **Notifications/toasts** — budget-warning, budget-exceeded, and
  recurring-rule-generated alerts surface as toast popups and in a
  persistent notification center.
- **Responsive layout** — a sidebar + grid dashboard on desktop, and a
  stacked layout with a bottom tab bar on mobile.

## Tech Stack

- **Next.js 14** (App Router, `app/` directory)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Zustand** for global state, persisted to `localStorage` via the
  `persist` middleware
- **TanStack Query** — `QueryClientProvider` is wired up app-wide as the
  data-fetching layer scaffold (this app's data is local-first, but the
  provider is ready for any future remote endpoints)
- **Recharts** for all charts

## Architecture

```
app/
  layout.tsx           Root layout: sidebar, bottom nav, providers, toasts
  page.tsx              Redirects "/" -> "/dashboard"
  globals.css           Tailwind directives + shared component classes
  dashboard/page.tsx     Stat cards + trend line + donut + comparison chart
  transactions/page.tsx  Transaction table, add/edit modal, CSV import/export
  budgets/page.tsx       Budget cards + recurring rule management
  accounts/page.tsx      Account cards, add/edit, transfer-between-accounts

components/
  Sidebar.tsx, BottomNav.tsx     Desktop sidebar / mobile bottom nav
  Header.tsx, NotificationCenter.tsx, ToastLayer.tsx
  Modal.tsx                      Reusable modal shell
  TransactionForm.tsx, TransactionTable.tsx, CsvControls.tsx
  BudgetCard.tsx, BudgetForm.tsx
  RecurringRuleForm.tsx, RecurringRuleList.tsx
  AccountCard.tsx, AccountForm.tsx, TransferForm.tsx
  StatCard.tsx
  charts/TrendLineChart.tsx, CategoryDonutChart.tsx, MonthComparisonChart.tsx
  QueryProvider.tsx, RecurringInitializer.tsx

store/
  useStore.ts   Single Zustand store (accounts, transactions, budgets,
                 recurring rules, notifications) persisted to localStorage

lib/
  types.ts      Shared TypeScript types and category lists
  seed.ts       Mock seed data (accounts, transactions, budgets, rules)
  recurring.ts  Pure recurring-rule occurrence generation logic
  csv.ts        CSV parse/generate + browser download helper
  utils.ts      Formatting, date-math, and misc helpers
```

### State management

Everything lives in one Zustand store (`store/useStore.ts`), persisted under
the `expense-tracker-storage` key in `localStorage`. Every mutating action
(`addTransaction`, `deleteAccount`, `transferBetweenAccounts`, etc.) also
keeps each account's `balance` in sync: adding an expense subtracts from the
account balance, adding income adds to it, editing a transaction reverses
the old effect before applying the new one, and deleting reverses it.

### Recurring-rule logic

A `RecurringRule` stores a `frequency` (`daily` / `weekly` / `monthly` /
`yearly`), a `startDate`, and a `lastGeneratedDate` (initially `null`).

`lib/recurring.ts#generateOccurrences` is a pure function that:

1. Starts at `lastGeneratedDate + 1 interval`, or `startDate` if the rule
   has never generated anything.
2. Steps forward one interval at a time, creating a `Transaction` for each
   date that is `<= today`.
3. Returns the list of newly generated transactions plus the new
   `lastGeneratedDate` to persist on the rule.

`RecurringInitializer` (mounted once in the root layout) calls
`processDueRecurringRules()` shortly after the app hydrates from
`localStorage`. That store action runs `generateOccurrences` for every
active rule, inserts the resulting transactions, applies their effect on
account balances, updates each rule's `lastGeneratedDate`, and — if
anything was generated — pushes a "N recurring transactions auto-generated"
notification. This means occurrences you missed while the app was closed
(e.g. a monthly rent charge) are backfilled automatically the next time you
open the app, without ever double-generating a date that was already
created.

### Budget logic

`lib/utils.ts#isSameMonth` filters transactions to the current calendar
month. For each `Budget` (a category + a monthly limit), `BudgetCard`
computes `spent` as the sum of this month's expense transactions in that
category, then renders a progress bar:

- **< 90% of limit** — brand-colored bar.
- **90–100% of limit** — amber "near limit" state.
- **> 100% of limit** — red "over budget" state.

`checkBudgetAlerts()` (run after every transaction mutation and after
recurring generation) compares each budget's spent/limit ratio and pushes a
`budget-warning` (≥ 90%) or `budget-exceeded` (≥ 100%) notification once per
category per month, avoiding duplicate alerts.

### CSV import/export

`lib/csv.ts` implements a small hand-written CSV reader/writer (quote
escaping included) so the app has zero runtime CSV dependency. Export walks
all transactions into a `date,type,category,account,amount,note` CSV and
triggers a browser download via an object URL. Import parses an uploaded
file, resolves the `account` column against existing account names
(falling back to the first account if unmatched), skips malformed rows with
a reported error count, and merges the rest into the store.

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The app redirects
to `/dashboard` and seeds itself with sample accounts, transactions,
budgets, and recurring rules on first load (stored in `localStorage`
thereafter).

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint with next/core-web-vitals rules
```

No test suite is included in this repository.
