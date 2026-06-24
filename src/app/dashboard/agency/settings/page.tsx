"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { agencySettingsApi, AgencyProfile } from "@/api/agencysettings.api";
import AgencyPaymentAccounts from "@/components/agency/AgencyPaymentAccounts";
import AgencyDirectorsPage from "@/app/dashboard/agency/directors/page";

export default function AgencySettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "directors" | "payments" | "audit"
  >("profile");

  // Profile State
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AgencyProfile>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    agencySettingsApi
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFormData(data);
      })
      .catch((error) => {
        console.error("Error loading agency profile:", error);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, []);

  const handleSaveProfile = async () => {
    try {
      const updated = await agencySettingsApi.updateProfile(formData);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      alert("✅ Agency profile updated successfully.");
    } catch (error: any) {
      console.error("Update failed:", error);
      // Show specific backend error if available
      const errorMsg =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update profile. Check permissions.";
      alert(`❌ ${errorMsg}`);
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading agency settings...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Agency Settings & Compliance
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your agency's legal compliance, financial routing, and
          operational audit logs.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { key: "profile", label: "Agency Profile" },
            { key: "directors", label: "Board of Directors" },
            { key: "payments", label: "Payment Accounts" },
            { key: "audit", label: "Audit & Activity Log" },
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
        {/* 1. PROFILE TAB (Editable) */}
        {activeTab === "profile" && profile && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                Business Information
              </h2>
              {profile.id !== 0 && (
                <button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                    isEditing
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              )}
            </div>

            {profile.id === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">
                  No agency registered yet.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Please complete the agency onboarding wizard to manage your
                  profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={profile.registration_number}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_email: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={formData.physical_address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physical_address: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. DIRECTORS TAB */}
        {activeTab === "directors" && (
          <div className="-m-6">
            <AgencyDirectorsPage />
          </div>
        )}

        {/* 3. PAYMENT ACCOUNTS TAB */}
        {activeTab === "payments" && <AgencyPaymentAccounts />}

        {/* 4. AUDIT & ACTIVITY LOG TAB */}
        {activeTab === "audit" && <AuditLogView />}
      </div>
    </div>
  );
}

// ==========================================
// AUDIT LOG SUB-COMPONENT (Unchanged)
// ==========================================
function AuditLogView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    agencySettingsApi.getActivityLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_entity.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            System Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all operational actions performed by agency staff.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center gap-1 whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Staff Member</th>
              <th className="px-6 py-3">Action Performed</th>
              <th className="px-6 py-3">Target / Details</th>
              <th className="px-6 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No logs match your search.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{log.staff_name}</p>
                    <p className="text-xs text-slate-400">{log.staff_role}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                    {log.target_entity}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                    {log.ip_address}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
