import { RecurringRule, Transaction } from "./types";
import { addInterval, todayISO, uid } from "./utils";

/**
 * Given a recurring rule, generate every occurrence from the day after its
 * last generated date (or its start date, if never generated) up to and
 * including today. Returns the new transactions and the new
 * "lastGeneratedDate" the rule should be updated to.
 */
export function generateOccurrences(
  rule: RecurringRule,
  today: string = todayISO()
): { transactions: Transaction[]; lastGeneratedDate: string | null } {
  if (!rule.active) {
    return { transactions: [], lastGeneratedDate: rule.lastGeneratedDate };
  }

  const transactions: Transaction[] = [];
  let cursor = rule.lastGeneratedDate
    ? addInterval(rule.lastGeneratedDate, rule.frequency)
    : rule.startDate;

  let lastGeneratedDate = rule.lastGeneratedDate;
  let guard = 0;

  while (cursor <= today && guard < 2000) {
    transactions.push({
      id: uid(),
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      accountId: rule.accountId,
      date: cursor,
      note: rule.note ? `${rule.note} (recurring)` : "Recurring transaction",
      recurringRuleId: rule.id,
    });
    lastGeneratedDate = cursor;
    cursor = addInterval(cursor, rule.frequency);
    guard += 1;
  }

  return { transactions, lastGeneratedDate };
}

export function nextOccurrenceDate(rule: RecurringRule): string {
  return rule.lastGeneratedDate
    ? addInterval(rule.lastGeneratedDate, rule.frequency)
    : rule.startDate;
}
