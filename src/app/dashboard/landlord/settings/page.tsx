"use client";

import React, { useState, useEffect } from "react";
import { dashboardApi, PaymentAccount } from "@/api/dashboard.api";
import { useAuthStore } from "@/store/auth.store";

export default function LandlordSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "payments" | "verification"
  >("profile");

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [simulatingId, setSimulatingId] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === "payments") {
      dashboardApi.getPaymentAccounts().then(setAccounts);
    }
  }, [activeTab]);

  const handleSimulatePayment = async (accountId: number) => {
    setSimulatingId(accountId);
    try {
      // Simulate a 15,000 KES payment
      const res = await dashboardApi.simulatePayment(accountId, 15000);
      alert(`✅ ${res.message}`);
    } catch (error: any) {
      alert(`❌ Simulation Failed: ${error.message || "Check backend logs"}`);
    } finally {
      setSimulatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "verified") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Account Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your profile, payment collection accounts, and verification
          status.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {["profile", "payments", "verification"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "payments" ? "Payment Accounts" : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={(user as any)?.full_name || "Landlord Name"}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={(user as any)?.email || "landlord@tennacy.com"}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  defaultValue="+254 700 000 000"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role
                </label>
                <input
                  type="text"
                  defaultValue="Landlord"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 capitalize"
                  readOnly
                />
              </div>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        )}

        {/* PAYMENT ACCOUNTS TAB */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Collection Accounts
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Accounts must be verified by Admin before receiving tenant
                  payments.
                </p>
              </div>
              <button
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="bg-secondary hover:bg-secondary/90 text-white text-sm font-bold py-2 px-4 rounded-lg"
              >
                + Add Account
              </button>
            </div>

            {/* Accounts List */}
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {acc.account_type === "paybill"
                        ? "P"
                        : acc.account_type === "till"
                          ? "T"
                          : "M"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        {acc.account_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {acc.account_type.toUpperCase()}: {acc.account_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${getStatusBadge(acc.verification_status)}`}
                    >
                      {acc.verification_status === "pending"
                        ? "Pending Admin Review"
                        : acc.verification_status}
                    </span>

                    {/* 🧪 PAYMENT SIMULATOR BUTTON (Only for verified accounts) */}
                    {acc.verification_status === "verified" && (
                      <button
                        onClick={() => handleSimulatePayment(acc.id)}
                        disabled={simulatingId === acc.id}
                        className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        title="Test an M-Pesa STK Push"
                      >
                        {simulatingId === acc.id
                          ? "Simulating..."
                          : "🧪 Simulate Payment"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {showAddAccount && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-bold mb-2">Add New Collection Account</p>
                <p>
                  In a full implementation, this opens a modal to enter
                  Paybill/Till details and upload proof of ownership for Admin
                  verification.
                </p>
              </div>
            )}
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">
              Landlord Verification
            </h2>
            <p className="text-sm text-slate-500">
              Upload your documents to unlock full platform features. Admins
              will review these within 24 hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "National ID / Passport",
                "KRA PIN Certificate",
                "Proof of Ownership (Title Deed)",
              ].map((doc) => (
                <div
                  key={doc}
                  className="p-4 border border-slate-200 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-slate-800">{doc}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Verified
                    </p>
                  </div>
                  <button className="text-xs text-primary font-bold hover:underline">
                    Replace
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
