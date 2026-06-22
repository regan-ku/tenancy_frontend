"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  tenantFinancialsApi,
  TenantInvoice,
  TenantPayment,
} from "@/api/tenantFinancials.api";
import { tenantDashboardApi, PersonalTenancy } from "@/api/tenantDashboard.api";
import STKPushModal from "@/components/tenant/STKPushModal";

const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

export default function TenantPaymentsPage() {
  const searchParams = useSearchParams();
  const initialTenancyId = searchParams.get("tenancy_id");

  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [selectedTenancyId, setSelectedTenancyId] = useState<number | null>(
    null,
  );

  const [invoices, setInvoices] = useState<TenantInvoice[]>([]);
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showSTKModal, setShowSTKModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TenantInvoice | null>(
    null,
  );

  // 1. Fetch all personal tenancies to populate the selector
  useEffect(() => {
    tenantDashboardApi.getMyPersonalTenancies().then((data) => {
      setTenancies(data);
      // Set default selection based on URL param or first tenancy
      const defaultId = initialTenancyId
        ? parseInt(initialTenancyId)
        : data[0]?.id;
      setSelectedTenancyId(defaultId || null);
      setLoading(false);
    });
  }, [initialTenancyId]);

  // 2. Fetch scoped financial data whenever the selected tenancy changes
  useEffect(() => {
    if (selectedTenancyId) {
      Promise.all([
        tenantFinancialsApi.getInvoices(selectedTenancyId),
        tenantFinancialsApi.getPayments(selectedTenancyId),
      ]).then(([invData, payData]) => {
        setInvoices(invData);
        setPayments(payData);
      });
    }
  }, [selectedTenancyId]);

  const selectedTenancy = tenancies.find((t) => t.id === selectedTenancyId);
  const totalOutstanding = invoices.reduce(
    (acc, inv) => acc + inv.balance_due,
    0,
  );

  const handlePayInvoice = (invoice: TenantInvoice) => {
    setSelectedInvoice(invoice);
    setShowSTKModal(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      partial: "bg-blue-100 text-blue-700",
      overdue: "bg-red-100 text-red-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Payments & Receipts
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          View invoices, track payment history, and download receipts for your
          tenancies.
        </p>
      </div>

      {/* ✅ TENANCY CONTEXT SELECTOR (Crucial for Multi-Tenancy) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
          Select Property to View Financials
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tenancies.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTenancyId(t.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedTenancyId === t.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <p className="font-bold text-slate-800 text-sm">
                {t.property_name}
              </p>
              <p className="text-xs text-slate-500">
                Unit {t.unit_code} • {t.unit_type}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selectedTenancy && (
        <>
          {/* Scoped KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KPICard
              title="Current Balance Due"
              value={formatCurrency(totalOutstanding)}
              color={totalOutstanding > 0 ? "text-red-600" : "text-green-600"}
            />
            <KPICard
              title="Next Due Date"
              value={selectedTenancy.next_billing_date}
              color="text-primary-dark"
            />
            <KPICard
              title="Monthly Rent"
              value={formatCurrency(selectedTenancy.rent_amount)}
              color="text-slate-800"
            />
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Invoices & Billing
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing billing history for{" "}
                <strong>
                  {selectedTenancy.property_name} - Unit{" "}
                  {selectedTenancy.unit_code}
                </strong>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {inv.billing_period}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {inv.due_date}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-red-600">
                        {formatCurrency(inv.balance_due)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(inv.status)}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.balance_due > 0 ? (
                          <button
                            onClick={() => handlePayInvoice(inv)}
                            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-xs text-green-600 font-bold">
                            Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History & Receipts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Payment History & Receipts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Transaction Code</th>
                    <th className="px-6 py-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No payments recorded for this tenancy yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((pay) => (
                      <tr
                        key={pay.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-600 text-xs">
                          {pay.payment_date}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-green-600">
                          {formatCurrency(pay.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded uppercase">
                            {pay.payment_method.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700 text-xs">
                          {pay.transaction_code}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              tenantFinancialsApi.downloadReceipt(
                                pay.receipt_url,
                              )
                            }
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-1 ml-auto"
                          >
                            <svg
                              className="w-3 h-3"
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
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* STK Push Modal */}
      {showSTKModal && selectedInvoice && selectedTenancy && (
        <STKPushModal
          invoice={selectedInvoice}
          tenancy={selectedTenancy}
          onClose={() => setShowSTKModal(false)}
          onSuccess={() => {
            // Refresh invoices to show updated balance
            if (selectedTenancyId)
              tenantFinancialsApi
                .getInvoices(selectedTenancyId)
                .then(setInvoices);
          }}
        />
      )}
    </div>
  );
}

function KPICard({ title, value, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
