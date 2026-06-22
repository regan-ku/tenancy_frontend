"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  tenantProfileApi,
  PersonalProfile,
  AgencyTenantProfile,
  NextOfKin,
  ManagementContact,
} from "@/api/tenantProfile.api";
import DocumentVault from "@/components/tenant/DocumentsVault";

export default function TenantSettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "profile" | "kin" | "contacts" | "docs"
  >("profile");

  // ✅ Determine if this tenant is an Agency renting space, or an Individual
  const isAgencyTenant =
    (user as any)?.role === "agency" || (user as any)?.is_agency_tenant;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          My Profile & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your identity, emergency contacts, property management
          contacts, and lease documents.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            {
              key: "profile",
              label: isAgencyTenant ? "Agency Profile" : "Personal Profile",
            },
            { key: "kin", label: "Next of Kin" },
            { key: "contacts", label: "Management Contacts" },
            { key: "docs", label: "Document Vault" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* 1. PROFILE TAB (Conditional Rendering) */}
        {activeTab === "profile" &&
          (isAgencyTenant ? <AgencyProfileForm /> : <PersonalProfileForm />)}

        {/* 2. NEXT OF KIN TAB */}
        {activeTab === "kin" && <NextOfKinManager />}

        {/* 3. MANAGEMENT CONTACTS TAB (Privacy Enforced) */}
        {activeTab === "contacts" && <ManagementContactsView />}

        {/* 4. DOCUMENTS TAB */}
        {activeTab === "docs" && <DocumentVault />}
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

// ✅ AGENCY PROFILE FORM (Matches Django AgencyProfile Model)
function AgencyProfileForm() {
  const [profile, setProfile] = useState<AgencyTenantProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    tenantProfileApi.getAgencyProfile().then(setProfile);
  }, []);
  if (!profile)
    return (
      <div className="py-8 text-center text-slate-400">
        Loading agency profile...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Corporate Identity & Business Details
          </h2>
          <p className="text-xs text-slate-500">
            As required for commercial tenancy agreements and KRA compliance.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`text-sm font-bold px-4 py-2 rounded-lg ${isEditing ? "bg-green-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          {isEditing ? "Save Changes" : "Edit Details"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Registered Business Name"
          value={profile.business_name}
          editable={isEditing}
        />
        <InputField
          label="Business Registration Number"
          value={profile.registration_number}
          editable={isEditing}
        />
        <InputField
          label="KRA PIN"
          value={profile.kra_pin}
          editable={isEditing}
        />
        <InputField
          label="Physical Address"
          value={profile.physical_address}
          editable={isEditing}
        />
        <InputField label="City" value={profile.city} editable={isEditing} />
        <InputField
          label="County"
          value={profile.county}
          editable={isEditing}
        />
        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            Primary Contact Person
          </h3>
        </div>
        <InputField
          label="Contact Person Name"
          value={profile.contact_person_name}
          editable={isEditing}
        />
        <InputField
          label="Contact Phone"
          value={profile.contact_person_phone}
          editable={isEditing}
        />
        <InputField
          label="Contact Email"
          value={profile.contact_person_email}
          editable={isEditing}
        />
      </div>
    </div>
  );
}

// ✅ PERSONAL PROFILE FORM
function PersonalProfileForm() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    tenantProfileApi.getPersonalProfile().then(setProfile);
  }, []);
  if (!profile)
    return (
      <div className="py-8 text-center text-slate-400">Loading profile...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          Personal Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`text-sm font-bold px-4 py-2 rounded-lg ${isEditing ? "bg-green-600 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          {isEditing ? "Save Changes" : "Edit Details"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Full Name"
          value={profile.full_name}
          editable={isEditing}
        />
        <InputField
          label="Phone Number"
          value={profile.phone_number}
          editable={isEditing}
        />
        <InputField
          label="Email Address"
          value={profile.email}
          editable={isEditing}
        />
        <InputField
          label="Nationality"
          value={profile.nationality}
          editable={isEditing}
        />
        <InputField
          label="ID / Passport Number"
          value={profile.id_number}
          editable={isEditing}
        />
      </div>
    </div>
  );
}

// ✅ NEXT OF KIN MANAGER
function NextOfKinManager() {
  const [kin, setKin] = useState<NextOfKin[]>([]);
  useEffect(() => {
    tenantProfileApi.getNextOfKin().then(setKin);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Emergency Contacts</h2>
        <button className="text-sm font-bold px-4 py-2 bg-primary text-white rounded-lg">
          + Add Contact
        </button>
      </div>
      <div className="space-y-3">
        {kin.map((k) => (
          <div
            key={k.id}
            className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:bg-slate-50"
          >
            <div>
              <p className="font-bold text-slate-800">
                {k.full_name}{" "}
                <span className="text-xs font-normal text-slate-500">
                  ({k.relationship})
                </span>
              </p>
              <p className="text-sm text-slate-600">
                {k.phone_number} • {k.city}
              </p>
            </div>
            <button className="text-xs text-primary font-bold hover:underline">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ PRIVACY-ENFORCED MANAGEMENT CONTACTS
function ManagementContactsView() {
  const [contacts, setContacts] = useState<ManagementContact[]>([]);
  useEffect(() => {
    tenantProfileApi.getManagementContacts().then(setContacts);
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-start gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <div>
          <p className="font-bold">Privacy & Communication Policy</p>
          <p className="text-xs mt-1">
            For security and operational efficiency, direct landlord contact
            information is kept confidential. Please use the contacts below for
            all property-related issues, emergencies, or inquiries.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((c) => (
          <div
            key={c.tenancy_id}
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <p className="font-bold text-slate-800">{c.property_name}</p>
              <p className="text-xs text-slate-500">Unit {c.unit_code}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${c.management_type === "agency" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
                >
                  {c.management_type === "agency"
                    ? "Managed by Agency"
                    : "On-Site Caretaker"}
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-slate-800">{c.contact_name}</p>
                <p className="text-slate-600 flex items-center gap-2">
                  📞{" "}
                  <a
                    href={`tel:${c.contact_phone}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {c.contact_phone}
                  </a>
                </p>
                <p className="text-slate-600 flex items-center gap-2">
                  ✉️{" "}
                  <a
                    href={`mailto:${c.contact_email}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {c.contact_email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ REUSABLE INPUT FIELD
function InputField({
  label,
  value,
  editable,
}: {
  label: string;
  value: string;
  editable: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        disabled={!editable}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}
