"use client";

import React, { useState } from "react";
import {
  tenantFinancialsApi,
  TenantInvoice,
  STKPushRequest,
} from "@/api/tenantFinancials.api";
import { PersonalTenancy } from "@/api/tenantDashboard.api";

interface STKPushModalProps {
  invoice: TenantInvoice;
  tenancy: PersonalTenancy;
  onClose: () => void;
  onSuccess: () => void;
}

export default function STKPushModal({
  invoice,
  tenancy,
  onClose,
  onSuccess,
}: STKPushModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("2547"); // Default prefix
  const [amount, setAmount] = useState(invoice.balance_due.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleInitiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 12)
      return alert(
        "Please enter a valid M-Pesa phone number (e.g., 254712345678).",
      );

    setIsProcessing(true);
    setStatusMessage("Sending STK Push to your phone...");

    try {
      const payload: STKPushRequest = {
        tenancy_id: tenancy.id,
        phone_number: phoneNumber,
        amount: parseFloat(amount),
      };

      const res = await tenantFinancialsApi.initiateSTKPush(payload);

      if (res.success) {
        setStatusMessage(
          `✅ Success! Check your phone for the M-Pesa prompt. \nFunds are routing directly to ${tenancy.landlord_or_agency_name}'s verified Paybill.`,
        );
        // In production, you would poll the backend or wait for a webhook to confirm payment
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 4000);
      }
    } catch (error) {
      setStatusMessage(
        "❌ Failed to initiate STK Push. Please check your number and try again.",
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-green-50">
          <div>
            <h2 className="text-xl font-bold text-green-800">Pay via M-Pesa</h2>
            <p className="text-xs text-green-600 mt-1">
              Invoice: {invoice.invoice_number}
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Routing Transparency Notice */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>🔒 Secure Routing:</strong> Funds are sent directly to{" "}
            <strong>{tenancy.landlord_or_agency_name}</strong>'s verified
            collection account. The platform does not hold your money.
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Amount to Pay (KES)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-xl font-extrabold text-primary-dark focus:ring-2 focus:ring-green-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Outstanding Balance: KES {invoice.balance_due.toLocaleString()}
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              M-Pesa Phone Number
            </label>
            <input
              type="text"
              placeholder="2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${statusMessage.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {statusMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleInitiatePayment}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Waiting for M-Pesa...
              </>
            ) : (
              <>📱 Initiate STK Push</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
