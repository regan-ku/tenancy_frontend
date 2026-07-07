"use client";
import React, { useState } from "react";
import { landlordSettingsApi } from "@/api/lanlLordSettings.api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  isFirstAccount: boolean;
}

export default function AddPaymentAccountModal({
  onClose,
  onSuccess,
  isFirstAccount,
}: Props) {
  const [accountType, setAccountType] = useState<"paybill" | "till" | "bank">(
    "paybill",
  );
  const [accountName, setAccountName] = useState("");
  const [paybillNumber, setPaybillNumber] = useState("");
  const [tillNumber, setTillNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accountName) return alert("Please provide an Account Name/Label.");

    setIsSubmitting(true);
    try {
      const payload: any = {
        account_type: accountType,
        account_name: accountName,
        is_default: isFirstAccount,
      };

      if (accountType === "paybill") {
        payload.paybill_number = paybillNumber;
        payload.account_number = accountNumber;
      } else if (accountType === "till") {
        payload.till_number = tillNumber;
      } else if (accountType === "bank") {
        payload.bank_name = bankName;
        payload.account_number = accountNumber;
      }

      await landlordSettingsApi.addPaymentAccount(payload);
      alert("✅ Account submitted for verification successfully!");
      onSuccess();
    } catch (error: any) {
      alert(`❌ ${error?.response?.data?.detail || "Failed to add account."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Register Collection Account
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-3">
            {(["paybill", "till", "bank"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm capitalize transition-all ${
                  accountType === type
                    ? "bg-primary/5 border-primary text-primary ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {type === "paybill"
                  ? "M-Pesa Paybill"
                  : type === "till"
                    ? "M-Pesa Till"
                    : "Bank"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Account Label
            </label>
            <input
              type="text"
              placeholder="e.g., Main Rent Collection"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountType === "paybill" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Paybill Number
                  </label>
                  <input
                    type="text"
                    value={paybillNumber}
                    onChange={(e) => setPaybillNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}
            {accountType === "till" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Till Number
                </label>
                <input
                  type="text"
                  value={tillNumber}
                  onChange={(e) => setTillNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            )}
            {accountType === "bank" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
