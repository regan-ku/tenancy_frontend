"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  landlordSettingsApi,
  LandlordProfile,
  NextOfKin,
  LandlordPaymentAccount,
  VerificationDocument,
} from "@/api/lanlLordSettings.api";
import NextOfKinModal from "@/components/landlord/NextOfKinModal";
import AddPaymentAccountModal from "@/components/landlord/AddPaymentAccountModal";

export default function LandlordSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "next_of_kin" | "payments" | "verification"
  >("profile");

  // State Management
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [nok, setNok] = useState<NextOfKin | null>(null);
  const [accounts, setAccounts] = useState<LandlordPaymentAccount[]>([]);
  const [verificationDocs, setVerificationDocs] = useState<
    VerificationDocument[]
  >([]);

  // UI States
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showNokModal, setShowNokModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [simulatingId, setSimulatingId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Refs for file uploads
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ==========================================
  // DATA FETCHING
  // ==========================================
  useEffect(() => {
    landlordSettingsApi.getProfile().then(setProfile).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeTab === "next_of_kin") {
      landlordSettingsApi.getNextOfKin().then(setNok);
    }
    if (activeTab === "payments") {
      landlordSettingsApi.getPaymentAccounts().then(setAccounts);
    }
    if (activeTab === "verification") {
      landlordSettingsApi.getVerificationStatus().then(setVerificationDocs);
    }
  }, [activeTab]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    setIsSavingProfile(true);
    try {
      const updated = await landlordSettingsApi.updateProfile({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
      });
      setProfile(updated);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      alert("❌ Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNok = async (data: NextOfKin) => {
    try {
      const saved = await landlordSettingsApi.saveNextOfKin(data);
      setNok(saved);
      setShowNokModal(false);
      alert("✅ Next of kin saved!");
    } catch (error) {
      alert("❌ Failed to save next of kin.");
    }
  };

  // ✅ UPDATED: Passes the profile phone number to the API instead of using a mock number
  const handleSimulatePayment = async (accountId: number) => {
    setSimulatingId(accountId);
    try {
      // Uses the logged-in landlord's phone number for the STK push test
      const testPhone =
        profile?.phone_number?.replace(/\D/g, "") || "254700000000";
      const res = await landlordSettingsApi.simulatePayment(
        accountId,
        15000,
        testPhone,
      );
      alert(`✅ ${res.message || "STK Push sent successfully!"}`);
    } catch (error: any) {
      alert(
        `❌ Simulation Failed: ${error.response?.data?.detail || error.message || "Check backend logs"}`,
      );
    } finally {
      setSimulatingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setActionLoadingId(id);
    try {
      await landlordSettingsApi.setDefaultAccount(id);
      const updated = await landlordSettingsApi.getPaymentAccounts();
      setAccounts(updated);
    } catch {
      alert("Failed to set default.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveAccount = async (id: number) => {
    if (!confirm("Remove this account?")) return;
    setActionLoadingId(id);
    try {
      await landlordSettingsApi.removePaymentAccount(id);
      const updated = await landlordSettingsApi.getPaymentAccounts();
      setAccounts(updated);
    } catch {
      alert("Failed to remove.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      await landlordSettingsApi.uploadDocument(file, docType);
      alert(`✅ ${docType} uploaded for verification!`);
      const updatedDocs = await landlordSettingsApi.getVerificationStatus();
      setVerificationDocs(updatedDocs);
    } catch (error) {
      alert("❌ Failed to upload document.");
    }
  };

  // ==========================================
  // UI HELPERS
  // ==========================================
  const getStatusBadge = (status: string) => {
    if (status === "verified") return "bg-green-100 text-green-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-600";
  };

  const getAccountDetails = (acc: LandlordPaymentAccount) => {
    if (acc.account_type === "paybill")
      return `Paybill: ${acc.paybill_number} | Acc: ${acc.account_number}`;
    if (acc.account_type === "till") return `Till: ${acc.till_number}`;
    if (acc.account_type === "bank")
      return `${acc.bank_name} | Acc: ${acc.account_number}`;
    return "";
  };

  const requiredDocs = [
    { type: "national_id", label: "National ID / Passport" },
    { type: "kra_pin", label: "KRA PIN Certificate" },
    { type: "proof_of_ownership", label: "Proof of Ownership (Title Deed)" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Account Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your profile, emergency contacts, payment collection accounts,
          and verification status.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { key: "profile", label: "Profile" },
            { key: "next_of_kin", label: "Next of Kin" },
            { key: "payments", label: "Payment Accounts" },
            { key: "verification", label: "Verification" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* 1. PROFILE TAB */}
        {activeTab === "profile" && profile && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
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
                  required
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={profile.phone_number || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, phone_number: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value="Landlord"
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 capitalize"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* 2. NEXT OF KIN TAB */}
        {activeTab === "next_of_kin" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                Emergency Contact
              </h2>
              <button
                onClick={() => setShowNokModal(true)}
                className="text-sm font-bold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {nok?.id ? "Edit Contact" : "+ Add Contact"}
              </button>
            </div>

            {nok?.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Full Name
                  </p>
                  <p className="text-slate-800 font-medium mt-1">
                    {nok.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Relationship
                  </p>
                  <p className="text-slate-800 font-medium mt-1">
                    {nok.relationship}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Phone Number
                  </p>
                  <p className="text-slate-800 font-medium mt-1">
                    {nok.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    City
                  </p>
                  <p className="text-slate-800 font-medium mt-1">{nok.city}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">
                  No next of kin registered.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Please add an emergency contact for security purposes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. PAYMENT ACCOUNTS TAB */}
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
                onClick={() => setShowAddAccountModal(true)}
                className="bg-secondary hover:bg-secondary/90 text-white text-sm font-bold py-2 px-4 rounded-lg"
              >
                + Add Account
              </button>
            </div>

            <div className="space-y-3">
              {accounts.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">
                    No payment accounts registered yet.
                  </p>
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {acc.account_type === "paybill"
                          ? "P"
                          : acc.account_type === "till"
                            ? "T"
                            : "B"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {acc.account_name}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">
                          {getAccountDetails(acc)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${getStatusBadge(acc.verification_status)}`}
                      >
                        {acc.verification_status === "pending"
                          ? "Pending Review"
                          : acc.verification_status}
                      </span>

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

                      {acc.verification_status === "verified" && (
                        <button
                          onClick={() => handleSimulatePayment(acc.id)}
                          disabled={simulatingId === acc.id}
                          className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                        >
                          {simulatingId === acc.id
                            ? "Simulating..."
                            : "🧪 Test STK"}
                        </button>
                      )}

                      <button
                        onClick={() => handleRemoveAccount(acc.id)}
                        disabled={actionLoadingId === acc.id}
                        className="text-xs text-red-500 hover:text-red-700 font-bold disabled:opacity-50"
                      >
                        {actionLoadingId === acc.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. VERIFICATION TAB */}
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
              {requiredDocs.map((doc) => {
                const docStatus = verificationDocs.find(
                  (v) => v.document_type === doc.type,
                );
                const status = docStatus?.status || "missing";

                return (
                  <div
                    key={doc.type}
                    className="p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{doc.label}</p>
                      <p
                        className={`text-xs font-bold mt-1 capitalize ${status === "verified" ? "text-green-600" : status === "pending" ? "text-yellow-600" : "text-slate-400"}`}
                      >
                        {status === "missing" ? "Not Uploaded" : status}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* ✅ FIXED: Wrapped assignment in curly braces to return void */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[doc.type] = el;
                        }}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, doc.type)}
                      />
                      <button
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        className="text-xs text-primary font-bold hover:underline whitespace-nowrap"
                      >
                        {status === "missing" ? "Upload" : "Replace"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showNokModal && (
        <NextOfKinModal
          initialData={nok}
          onClose={() => setShowNokModal(false)}
          onSave={handleSaveNok}
        />
      )}

      {showAddAccountModal && (
        <AddPaymentAccountModal
          onClose={() => setShowAddAccountModal(false)}
          onSuccess={() => {
            setShowAddAccountModal(false);
            landlordSettingsApi.getPaymentAccounts().then(setAccounts);
          }}
          isFirstAccount={accounts.length === 0}
        />
      )}
    </div>
  );
}
