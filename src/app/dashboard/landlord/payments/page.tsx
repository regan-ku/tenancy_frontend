"use client";

import React, { useState, useEffect } from "react";
import {
  paymentsApi,
  FinancialOverview,
  PropertyFinancials,
  TenantLedgerItem,
} from "@/api/payments.api";
import PaymentActionsModal from "@/components/landlord/PaymentActionsModal";

export default function LandlordPaymentsPage() {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [propertyFinancials, setPropertyFinancials] = useState<
    PropertyFinancials[]
  >([]);
  const [ledger, setLedger] = useState<TenantLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"stk" | "reminder">("stk");
  const [selectedTenant, setSelectedTenant] = useState<TenantLedgerItem | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      const [overviewData, propFinData, ledgerData] = await Promise.all([
        paymentsApi.getFinancialOverview(),
        paymentsApi.getPropertyFinancials(),
        paymentsApi.getMasterLedger(),
      ]);
      setOverview(overviewData);
      setPropertyFinancials(propFinData);
      setLedger(ledgerData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const openModal = (action: "stk" | "reminder", tenant: TenantLedgerItem) => {
    setModalAction(action);
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const blob = await paymentsApi.downloadReceipt(receiptId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to download receipt.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Financial Command Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track collections, manage arrears, and request payments across all
          your properties.
        </p>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-28 bg-slate-100 animate-pulse rounded-2xl"
              ></div>
            ))
        ) : (
          <>
            <KPICard
              title="Collected (This Month)"
              value={formatCurrency(overview?.total_collected_this_month || 0)}
              icon="💰"
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Total Arrears"
              value={formatCurrency(overview?.total_arrears || 0)}
              icon="⚠️"
              color="bg-red-50 text-red-600"
            />
            <KPICard
              title="Pending Invoices"
              value={overview?.pending_invoices || 0}
              icon="🧾"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Occupancy Rate"
              value={`${overview?.occupancy_rate || 0}%`}
              icon="📈"
              color="bg-purple-50 text-purple-600"
            />
          </>
        )}
      </div>

      {/* Financial Status by Property */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Financial Status by Property
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyFinancials.map((prop) => (
            <div
              key={prop.property_id}
              className="p-4 border border-slate-200 rounded-xl hover:border-primary/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-slate-800">
                    {prop.property_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {prop.total_units} Units
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  Property ID: {prop.property_id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Collected
                  </p>
                  <p className="text-lg font-extrabold text-green-600">
                    {formatCurrency(prop.collected_this_month)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Arrears
                  </p>
                  <p className="text-lg font-extrabold text-red-600">
                    {formatCurrency(prop.outstanding_arrears)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Ledger & Tenant Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Master Ledger & Tenant Actions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Request payments, send reminders, and download receipts.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tenant & Unit</th>
                <th className="px-6 py-4">Rent / Paid / Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {tenant.tenant_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tenant.unit_code} • {tenant.property_name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tenant.tenant_phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-600">
                        Rent: <b>{formatCurrency(tenant.rent_amount)}</b>
                      </span>
                      <span className="text-green-600">
                        Paid: <b>{formatCurrency(tenant.amount_paid)}</b>
                      </span>
                      {tenant.balance > 0 && (
                        <span className="text-red-600 font-bold">
                          Due: <b>{formatCurrency(tenant.balance)}</b>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        tenant.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : tenant.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {tenant.balance > 0 && (
                        <>
                          <button
                            onClick={() => openModal("stk", tenant)}
                            className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Request STK
                          </button>
                          <button
                            onClick={() => openModal("reminder", tenant)}
                            className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200"
                          >
                            Remind
                          </button>
                        </>
                      )}
                      {tenant.receipt_id && (
                        <button
                          onClick={() =>
                            handleDownloadReceipt(tenant.receipt_id!)
                          }
                          className="text-xs text-secondary hover:underline font-bold"
                        >
                          Receipt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {isModalOpen && selectedTenant && (
        <PaymentActionsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          action={modalAction}
          tenant={selectedTenant}
        />
      )}
    </div>
  );
}

// Sub-component for KPI Cards
function KPICard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className="text-xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}
