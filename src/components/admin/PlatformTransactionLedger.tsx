"use client";

import React, { useState, useEffect } from "react";
import { adminFinancialsApi, TransactionLog } from "@/api/adminFInancials.api";

export default function PlatformTransactionLedger() {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    adminFinancialsApi.getTransactionLogs().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transaction_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.reconciliation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Ledger Filters */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tenant, property, or transaction code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="reconciled">Reconciled</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Ledger
        </button>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Transaction Details</th>
              <th className="px-6 py-4">Tenant & Property</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Routed To (Destination)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading ledger...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-slate-800 text-xs">
                      {txn.transaction_code}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {txn.timestamp}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {txn.tenant_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {txn.property_name} • {txn.unit_code}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary-dark">
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 text-xs">
                      {txn.routed_to}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Acc: {txn.destination_account}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        txn.reconciliation_status === "reconciled"
                          ? "bg-green-100 text-green-700"
                          : txn.reconciliation_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {txn.reconciliation_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
        <span>
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </span>
        <span className="font-bold text-primary-dark">
          Total Visible Volume:{" "}
          {formatCurrency(
            filteredTransactions.reduce((acc, t) => acc + t.amount, 0),
          )}
        </span>
      </div>
    </div>
  );
}
