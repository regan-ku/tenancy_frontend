"use client";

import React, { useState } from "react";
import apiClient from "@/api/axios";
import { Unit } from "@/api/agencyUnitManagement.api";

interface TenantCreationResult {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
}

interface AddTenantModalProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: (data: TenantCreationResult) => void;
}

export default function AddTenantModal({
  unit,
  onClose,
  onSuccess,
}: AddTenantModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // 1. Tenant Identity States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // 2. Profile Data States
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [nationality, setNationality] = useState("Kenyan");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  // 3. Next of Kin States
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("spouse");
  const [nokPhone, setNokPhone] = useState("");
  const [nokCity, setNokCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      tenant_data: {
        email: email,
        phone_number: phone,
      },
      profile_data: {
        full_name: fullName,
        national_id: nationalId,
        nationality: nationality,
        address: address,
        date_of_birth: dob || null,
      },
      next_of_kin_data: {
        full_name: nokName,
        relationship: nokRelationship,
        phone_number: nokPhone,
        city: nokCity,
      },
    };

    try {
      const response = await apiClient.post(
        "/accounts/manager-tenants/create/",
        payload,
      );

      const newTenantId = response.data.tenant_id;

      onSuccess({
        id: newTenantId,
        full_name: fullName,
        email: email,
        phone_number: phone,
      });
    } catch (err: any) {
      console.error("Tenant creation failed:", err);
      const errData = err?.response?.data;
      let errorMsg = "Failed to create tenant. Please check the fields.";

      if (errData) {
        if (errData.tenant_data)
          errorMsg = Object.values(errData.tenant_data).join(" ");
        else if (errData.profile_data)
          errorMsg = Object.values(errData.profile_data).join(" ");
        else if (errData.next_of_kin_data)
          errorMsg = Object.values(errData.next_of_kin_data).join(" ");
        else if (errData.error) errorMsg = errData.error;
      }
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Add New Tenant</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Creating account for <strong>{unit.unit_code}</strong> • Rent: KES{" "}
              {Number(unit.rent_amount).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            ℹ️ This will create a new user account, profile, and next of kin.
            The system will generate a temporary password and send it to the
            tenant.
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* SECTION 1: Account Credentials */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
              1. Account Credentials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="tenant@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required // ✅ NOW REQUIRED
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="0712345678"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Profile Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
              2. Profile Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  National ID{" "}
                  <span className="text-slate-400 font-normal normal-case">
                    (Optional)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  // ✅ NO REQUIRED ATTRIBUTE HERE
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  required // ✅ NOW REQUIRED
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required // ✅ NOW REQUIRED
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  required // ✅ NOW REQUIRED
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Next of Kin */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
              3. Next of Kin
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={nokName}
                  onChange={(e) => setNokName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Relationship *
                </label>
                <select
                  required
                  value={nokRelationship}
                  onChange={(e) => setNokRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                >
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="child">Child</option>
                  <option value="relative">Relative</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={nokPhone}
                  onChange={(e) => setNokPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required // ✅ NOW REQUIRED
                  value={nokCity}
                  onChange={(e) => setNokCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              "Create Tenant & Proceed to Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
