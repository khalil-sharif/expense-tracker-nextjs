"use client";

import { useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { csvToTransactions, downloadCsv, transactionsToCsv } from "@/lib/csv";

export default function CsvControls() {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const importTransactions = useStore((s) => s.importTransactions);
  const addNotification = useStore((s) => s.addNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  function handleExport() {
    const accountNameById = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
    const csv = transactionsToCsv(transactions, accountNameById);
    downloadCsv(`transactions-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const accountIdByName = Object.fromEntries(accounts.map((a) => [a.name, a.id]));
      const fallbackAccountId = accounts[0]?.id ?? "";
      const { transactions: imported, errors } = csvToTransactions(
        text,
        accountIdByName,
        fallbackAccountId
      );

      if (imported.length > 0) {
        importTransactions(imported);
        addNotification({
          type: "recurring-generated",
          message: `Imported ${imported.length} transaction${imported.length === 1 ? "" : "s"} from CSV.`,
        });
      }

      setImportMessage(
        errors.length > 0
          ? `Imported ${imported.length} row(s). ${errors.length} row(s) skipped.`
          : `Imported ${imported.length} row(s) successfully.`
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={handleExport} className="btn-secondary text-xs">
        ⬇️ Export CSV
      </button>
      <button type="button" onClick={handleImportClick} className="btn-secondary text-xs">
        ⬆️ Import CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />
      {importMessage && <span className="text-xs text-gray-500">{importMessage}</span>}
    </div>
  );
}
