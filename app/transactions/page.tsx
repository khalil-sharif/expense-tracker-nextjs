"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TransactionTable from "@/components/TransactionTable";
import TransactionForm from "@/components/TransactionForm";
import CsvControls from "@/components/CsvControls";
import { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div className="flex-1">
      <Header title="Transactions" subtitle="Add, edit, and review your income and expenses" />

      <main className="space-y-4 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CsvControls />
          <button type="button" onClick={openAdd} className="btn-primary self-start sm:self-auto">
            + Add Transaction
          </button>
        </div>

        <TransactionTable onEdit={openEdit} />
      </main>

      {showForm && <TransactionForm onClose={closeForm} editing={editing} />}
    </div>
  );
}
