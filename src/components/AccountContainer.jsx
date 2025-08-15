import React, { useState, useEffect } from "react";
import TransactionsList from "./TransactionsList";
import Search from "./Search";
import AddTransactionForm from "./AddTransactionForm";
import Sort from "./Sort";

function AccountContainer() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:6001/transactions")
      .then((r) => r.json())
      .then((data) => setTransactions(data));
  }, []);

  function postTransaction(newTransaction) {
    fetch("http://localhost:6001/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTransaction),
    })
      .then((r) => r.json())
      .then((data) => setTransactions((prev) => [...prev, data]));
  }

  // Sort transactions by description or category
  function onSort(sortBy) {
    setTransactions((prev) => {
      const copy = [...prev];
      if (sortBy === "description" || sortBy === "category") {
        copy.sort((a, b) =>
          String(a[sortBy]).localeCompare(String(b[sortBy]), undefined, {
            sensitivity: "base",
          })
        );
      }
      return copy;
    });
  }

  // Filtered list based on search (checks description and category)
  const filtered = transactions.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(t.description).toLowerCase().includes(q) ||
      String(t.category).toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Search setSearch={setSearch} />
      <AddTransactionForm postTransaction={postTransaction} />
      <Sort onSort={onSort} />
      <TransactionsList transactions={filtered} />
    </div>
  );
}

export default AccountContainer;

