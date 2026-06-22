"use client";

import React, { useState } from "react";
import {
  LandlordSettlement,
  agencyFinancialsApi,
} from "@/api/agencyFinancials.api";

interface LandlordSettlementModalProps {
  settlement: LandlordSettlement;
  onClose: () => void;
}

export default function LandlordSettlementModal({
  settlement,
  onClose,
}: LandlordSettlementModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await agencyFinancialsApi.generateSettlementPDF(settlement.id);
      alert("✅ Settlement statement generated and ready for download/email.");
    } catch (error) {
      alert("Failed to generate statement.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Landlord Settlement Statement
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Period: {settlement.period}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body: The Statement */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Landlord Info */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">
                Prepared For
              </p>
              <p className="text-lg font-bold text-slate-800">
                {settlement.landlord_name}
              </p>
              <p className="text-sm text-slate-500">
                {settlement.landlord_email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Managed Properties
              </p>
              <p className="text-lg font-bold text-primary-dark">
                {settlement.properties_managed}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">
                Gross Rent Collected (All Units)
              </span>
              <span className="text-lg font-extrabold text-slate-800">
                {formatCurrency(settlement.gross_rent_collected)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
              <div>
                <span className="text-sm font-medium text-red-800">
                  Agency Management Fee Deduction
                </span>
                <p className="text-xs text-red-600">
                  Calculated at {settlement.agency_fee_percentage}% of gross
                  collection
                </p>
              </div>
              <span className="text-lg font-extrabold text-red-700">
                - {formatCurrency(settlement.agency_fee_amount)}
              </span>
            </div>

            <div className="flex justify-between items-center p-5 bg-green-50 rounded-xl border-2 border-green-200">
              <span className="text-base font-bold text-green-800">
                Net Payout to Landlord
              </span>
              <span className="text-2xl font-extrabold text-green-700">
                {formatCurrency(settlement.net_landlord_payout)}
              </span>
            </div>
          </div>

          {/* Compliance / Note */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>Note:</strong> As per the Tennacy platform architecture,
            funds are routed directly to verified accounts. This statement
            serves as the official reconciliation record for the specified
            period.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Close
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Generating...
              </>
            ) : (
              <>
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download PDF Statement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
