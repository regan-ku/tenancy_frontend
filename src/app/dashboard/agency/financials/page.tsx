"use client";

import React, { useState, useEffect } from "react";
import {
  agencyFinancialsApi,
  AgencyFinancialKPIs,
  CollectionLedgerItem,
  LandlordSettlement,
} from "@/api/agencyFinancials.api";
import LandlordSettlementModal from "@/components/agency/LandlordSettlementModal";

export default function AgencyFinancialsPage() {
  const [kpis, setKpis] = useState<AgencyFinancialKPIs | null>(null);
  const [ledger, setLedger] = useState<CollectionLedgerItem[]>([]);
  const [settlements, setSettlements] = useState<LandlordSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "settlements">(
    "ledger",
  );

  const [selectedSettlement, setSelectedSettlement] =
    useState<LandlordSettlement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [kpiData, ledgerData, settlementData] = await Promise.all([
        agencyFinancialsApi.getKPIs(),
        agencyFinancialsApi.getCollectionLedger(),
        agencyFinancialsApi.getLandlordSettlements(),
      ]);
      setKpis(kpiData);
      setLedger(ledgerData);
      setSettlements(settlementData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reconciled":
        return "bg-green-100 text-green-700";
      case "statement_sent":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
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
          Track rent collection, manage agency commissions, and reconcile
          landlord payouts.
        </p>
      </div>

      {/* KPI Cards */}
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
              title="Total Collected (Month)"
              value={formatCurrency(kpis?.total_collected_month || 0)}
              icon="💰"
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Agency Commission Earned"
              value={formatCurrency(kpis?.agency_commission_earned || 0)}
              icon="📈"
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Pending Reconciliation"
              value={formatCurrency(kpis?.pending_reconciliation || 0)}
              icon="⏳"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Overdue Arrears"
              value={formatCurrency(kpis?.overdue_arrears || 0)}
              icon="⚠️"
              color="bg-red-50 text-red-600"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "ledger", label: "Rent Collection Ledger" },
            { key: "settlements", label: "Landlord Settlements" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* RENT COLLECTION LEDGER */}
        {activeTab === "ledger" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Property & Unit</th>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Collection Route</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {item.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Unit {item.unit_code}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.tenant_name}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-primary-dark">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${item.collection_destination === "agency_paybill" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {item.collection_destination === "agency_paybill"
                          ? "Agency Paybill"
                          : "Direct to Landlord"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {item.payment_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LANDLORD SETTLEMENTS */}
        {activeTab === "settlements" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Landlord</th>
                  <th className="px-6 py-4">Gross Rent Collected</th>
                  <th className="px-6 py-4">Agency Fee Deducted</th>
                  <th className="px-6 py-4">Net Payout to Landlord</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((settlement) => (
                  <tr
                    key={settlement.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {settlement.landlord_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {settlement.properties_managed} Properties •{" "}
                        {settlement.period}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {formatCurrency(settlement.gross_rent_collected)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      - {formatCurrency(settlement.agency_fee_amount)}
                      <span className="text-xs text-slate-400 ml-1">
                        ({settlement.agency_fee_percentage}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-green-600">
                      {formatCurrency(settlement.net_landlord_payout)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(settlement.reconciliation_status)}`}
                      >
                        {settlement.reconciliation_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSettlement(settlement)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                      >
                        View Statement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlement Modal */}
      {selectedSettlement && (
        <LandlordSettlementModal
          settlement={selectedSettlement}
          onClose={() => setSelectedSettlement(null)}
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
