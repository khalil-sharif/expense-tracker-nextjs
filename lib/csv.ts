import { Category, Transaction, TransactionType } from "./types";
import { uid } from "./utils";

const HEADERS = ["date", "type", "category", "account", "amount", "note"];

export function transactionsToCsv(
  transactions: Transaction[],
  accountNameById: Record<string, string>
): string {
  const rows = transactions.map((t) => {
    const account = accountNameById[t.accountId] ?? t.accountId;
    return [
      t.date,
      t.type,
      csvEscape(t.category),
      csvEscape(account),
      t.amount.toFixed(2),
      csvEscape(t.note ?? ""),
    ].join(",");
  });
  return [HEADERS.join(","), ...rows].join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export interface CsvImportResult {
  transactions: Transaction[];
  errors: string[];
}

export function csvToTransactions(
  csvText: string,
  accountIdByName: Record<string, string>,
  fallbackAccountId: string
): CsvImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { transactions: [], errors: ["CSV file is empty."] };
  }

  const header = lines[0].toLowerCase();
  const startIdx = header.startsWith("date") ? 1 : 0;
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 5) {
      errors.push(`Line ${i + 1}: not enough columns, skipped.`);
      continue;
    }
    const [date, type, category, account, amount, note = ""] = cols;
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum)) {
      errors.push(`Line ${i + 1}: invalid amount "${amount}", skipped.`);
      continue;
    }
    if (type !== "income" && type !== "expense") {
      errors.push(`Line ${i + 1}: invalid type "${type}", skipped.`);
      continue;
    }
    const accountId = accountIdByName[account] ?? fallbackAccountId;
    transactions.push({
      id: uid(),
      type: type as TransactionType,
      amount: Math.abs(amountNum),
      category: (category || "Other") as Category,
      accountId,
      date: date || new Date().toISOString().slice(0, 10),
      note,
    });
  }

  return { transactions, errors };
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
