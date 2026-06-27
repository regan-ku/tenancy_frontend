"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

interface SettlementBreakdown {
  deposit_held: string;
  penalties_applied: string;
  outstanding_arrears: string;
  net_refund: string;
  amount_owed_by_tenant: string;
  requires_tenant_payment: boolean;
}

interface TerminationSettlementModalProps {
  tenancyId: number;
  tenantName: string;
  initialPenalty: number;
  onClose: () => void;
  onComplete: () => void;
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

export default function TerminationSettlementModal({
  tenancyId,
  tenantName,
  initialPenalty,
  onClose,
  onComplete,
}: TerminationSettlementModalProps) {
  const [settlement, setSettlement] = useState<SettlementBreakdown | null>(
    null,
  );
  const [managerDeductions, setManagerDeductions] = useState<string>("0");
  const [waiveArrears, setWaiveArrears] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState("");

  // Fetch preview whenever manager changes inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSettlement();
    }, 500); // Debounce API calls
    return () => clearTimeout(timer);
  }, [managerDeductions, waiveArrears]);

  const fetchSettlement = async () => {
    setIsCalculating(true);
    try {
      const response = await apiClient.get(
        `${endpoints.TENANCIES.DETAIL(tenancyId)}settlement-preview/`,
        {
          params: {
            penalty: initialPenalty,
            manager_deductions: managerDeductions,
            waive_arrears: waiveArrears,
          },
        },
      );
      setSettlement(response.data);
    } catch (err) {
      console.error("Failed to calculate settlement", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFinalize = async () => {
    if (
      !confirm(
        "Are you sure you want to finalize this settlement and vacate the unit? This action cannot be undone.",
      )
    )
      return;

    setIsFinalizing(true);
    setError("");
    try {
      await apiClient.post(
        `${endpoints.TENANCIES.DETAIL(tenancyId)}finalize-settlement/`,
        {
          manager_deductions: parseFloat(managerDeductions) || 0,
          waive_arrears: waiveArrears,
        },
      );
      alert(
        "✅ Settlement finalized. Unit has been vacated and refund processed.",
      );
      onComplete();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to finalize settlement.",
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Finalize Move-Out Settlement
            </h3>
            <p className="text-sm text-slate-500 mt-1">Tenant: {tenantName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isCalculating ? (
            <div className="text-center py-8 text-slate-400">
              Calculating settlement...
            </div>
          ) : settlement ? (
            <>
              {/* Settlement Breakdown */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-700 text-sm uppercase">
                  Financial Breakdown
                </h4>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Deposit Held:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(settlement.deposit_held)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">System Penalties:</span>
                  <span className="font-bold text-red-600">
                    - {formatCurrency(settlement.penalties_applied)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Outstanding Arrears:</span>
                  <span
                    className={`font-bold ${waiveArrears ? "line-through text-slate-400" : "text-red-600"}`}
                  >
                    - {formatCurrency(settlement.outstanding_arrears)}
                  </span>
                </div>

                <div className="border-t border-slate-300 pt-3 flex justify-between text-base">
                  <span className="font-bold text-slate-800">Net Result:</span>
                  {settlement.requires_tenant_payment ? (
                    <span className="font-extrabold text-red-700">
                      Tenant Owes:{" "}
                      {formatCurrency(settlement.amount_owed_by_tenant)}
                    </span>
                  ) : (
                    <span className="font-extrabold text-green-700">
                      Refund: {formatCurrency(settlement.net_refund)}
                    </span>
                  )}
                </div>
              </div>

              {/* Manager Adjustments */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Additional Deductions (e.g., Physical Damages)
                  </label>
                  <input
                    type="number"
                    value={managerDeductions}
                    onChange={(e) => setManagerDeductions(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={waiveArrears}
                    onChange={(e) => setWaiveArrears(e.target.checked)}
                    className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-amber-800">
                      Waive Outstanding Arrears
                    </p>
                    <p className="text-xs text-amber-700">
                      Check this to forgive the tenant's unpaid rent balance.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isFinalizing}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalize}
            disabled={isFinalizing || isCalculating}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isFinalizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Vacating Unit...
              </>
            ) : (
              "Execute Move-Out & Process Refund"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
