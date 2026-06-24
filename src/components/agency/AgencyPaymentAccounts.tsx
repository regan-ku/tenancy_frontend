"use client";

import React, { useState, useEffect } from "react";
import {
  agencySettingsApi,
  AgencyPaymentAccount,
} from "@/api/agencysettings.api";

export default function AgencyPaymentAccounts() {
  const [accounts, setAccounts] = useState<AgencyPaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ Action loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [newAccount, setNewAccount] = useState({
    account_type: "paybill" as "paybill" | "till" | "bank",
    account_name: "",
    paybill_number: "",
    till_number: "",
    account_number: "",
    bank_name: "",
  });

  // ✅ Fetch accounts from real backend
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await agencySettingsApi.getPaymentAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ✅ Real API submission
  const handleAddAccount = async () => {
    if (!newAccount.account_name) {
      return alert("Please provide an Account Name/Label.");
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        account_type: newAccount.account_type,
        account_name: newAccount.account_name,
        is_default: accounts.length === 0, // Auto-set as default if it's the first one
      };

      if (newAccount.account_type === "paybill") {
        payload.paybill_number = newAccount.paybill_number;
        payload.account_number = newAccount.account_number;
      } else if (newAccount.account_type === "till") {
        payload.till_number = newAccount.till_number;
      } else if (newAccount.account_type === "bank") {
        payload.bank_name = newAccount.bank_name;
        payload.account_number = newAccount.account_number;
      }

      await agencySettingsApi.addPaymentAccount(payload);

      alert("✅ Account submitted for verification successfully!");
      setShowAddForm(false);

      // Reset form
      setNewAccount({
        account_type: "paybill",
        account_name: "",
        paybill_number: "",
        till_number: "",
        account_number: "",
        bank_name: "",
      });

      // Refresh list
      await fetchAccounts();
    } catch (error: any) {
      console.error("Failed to add account:", error);
      const errorMsg =
        error?.response?.data?.detail ||
        "Failed to add account. Please check your details.";
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Real API: Set Default
  const handleSetDefault = async (id: number) => {
    setActionLoadingId(id);
    try {
      await agencySettingsApi.setDefaultAccount(id);
      await fetchAccounts();
    } catch (error) {
      alert("Failed to set default account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ✅ Real API: Remove Account
  const handleRemoveAccount = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to remove this account? This cannot be undone.",
      )
    )
      return;

    setActionLoadingId(id);
    try {
      await agencySettingsApi.removePaymentAccount(id);
      await fetchAccounts();
    } catch (error) {
      alert("Failed to remove account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getAccountDetails = (acc: AgencyPaymentAccount) => {
    if (acc.account_type === "paybill")
      return `Paybill: ${acc.paybill_number} | Acc: ${acc.account_number}`;
    if (acc.account_type === "till") return `Till: ${acc.till_number}`;
    if (acc.account_type === "bank")
      return `${acc.bank_name} | Acc: ${acc.account_number}`;
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Agency Collection Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define where tenant rent payments are routed. Accounts must be
            verified by System Admin.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm font-bold px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 shadow-sm"
        >
          + Add Account
        </button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold text-blue-800 text-sm">
            Register New Collection Account
          </h3>

          <div className="flex gap-3">
            {(["paybill", "till", "bank"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setNewAccount({ ...newAccount, account_type: type })
                }
                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm capitalize transition-all ${
                  newAccount.account_type === type
                    ? "bg-white border-primary text-primary ring-2 ring-primary/20"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {type === "paybill"
                  ? "M-Pesa Paybill"
                  : type === "till"
                    ? "M-Pesa Till"
                    : "Bank Account"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Account Name / Label (e.g., Main Rent)"
              value={newAccount.account_name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, account_name: e.target.value })
              }
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />

            {newAccount.account_type === "paybill" && (
              <>
                <input
                  type="text"
                  placeholder="Paybill Number (e.g., 247247)"
                  value={newAccount.paybill_number}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      paybill_number: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={newAccount.account_number}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      account_number: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </>
            )}

            {newAccount.account_type === "till" && (
              <input
                type="text"
                placeholder="Till Number (e.g., 123456)"
                value={newAccount.till_number}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, till_number: e.target.value })
                }
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm md:col-span-2"
              />
            )}

            {newAccount.account_type === "bank" && (
              <>
                <input
                  type="text"
                  placeholder="Bank Name (e.g., KCB Bank)"
                  value={newAccount.bank_name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, bank_name: e.target.value })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Bank Account Number"
                  value={newAccount.account_number}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      account_number: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddAccount}
              disabled={isSubmitting}
              className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-500 text-sm font-medium px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-3">Account Details</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Verification Status</th>
              <th className="px-6 py-3">Default</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No payment accounts registered yet.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {acc.account_name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {getAccountDetails(acc)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {acc.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(acc.verification_status)}`}
                    >
                      {acc.verification_status === "pending"
                        ? "Pending Admin Review"
                        : acc.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {acc.is_default ? (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(acc.id)}
                        disabled={actionLoadingId === acc.id}
                        className="text-xs text-slate-400 hover:text-primary font-medium disabled:opacity-50"
                      >
                        {actionLoadingId === acc.id
                          ? "Setting..."
                          : "Set Default"}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveAccount(acc.id)}
                      disabled={actionLoadingId === acc.id}
                      className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline disabled:opacity-50"
                    >
                      {actionLoadingId === acc.id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Compliance Note */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 flex items-start gap-2">
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p>
          <strong>Security Notice:</strong> Adding or changing payment accounts
          triggers an automatic audit log and suspends rent routing until a
          System Admin verifies the ownership documents.
        </p>
      </div>
    </div>
  );
}
