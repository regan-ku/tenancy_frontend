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

// ✅ AGENCY PROFILE FORM
function AgencyProfileForm() {
  const [profile, setProfile] = useState<AgencyTenantProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantProfileApi.getAgencyProfile()
      .then(setProfile)
      .catch(() => alert("Failed to load agency profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await tenantProfileApi.updateAgencyProfile(profile);
      setProfile(updated);
      setIsEditing(false);
      alert("✅ Agency profile updated successfully!");
    } catch (error) {
      alert("❌ Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading agency profile...</div>;
  if (!profile) return <div className="py-8 text-center text-red-500">No agency profile found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Corporate Identity & Business Details</h2>
          <p className="text-xs text-slate-500">As required for commercial tenancy agreements and KRA compliance.</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
            isEditing 
              ? "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Registered Business Name" value={profile.business_name} editable={isEditing} onChange={(val) => setProfile({ ...profile, business_name: val })} />
        <InputField label="Business Registration Number" value={profile.registration_number} editable={isEditing} onChange={(val) => setProfile({ ...profile, registration_number: val })} />
        <InputField label="KRA PIN" value={profile.kra_pin} editable={isEditing} onChange={(val) => setProfile({ ...profile, kra_pin: val })} />
        <InputField label="Physical Address" value={profile.physical_address} editable={isEditing} onChange={(val) => setProfile({ ...profile, physical_address: val })} />
        <InputField label="City" value={profile.city} editable={isEditing} onChange={(val) => setProfile({ ...profile, city: val })} />
        <InputField label="County" value={profile.county} editable={isEditing} onChange={(val) => setProfile({ ...profile, county: val })} />
        
        <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Primary Contact Person</h3>
        </div>
        <InputField label="Contact Person Name" value={profile.contact_person_name} editable={isEditing} onChange={(val) => setProfile({ ...profile, contact_person_name: val })} />
        <InputField label="Contact Phone" value={profile.contact_person_phone} editable={isEditing} onChange={(val) => setProfile({ ...profile, contact_person_phone: val })} />
        <InputField label="Contact Email" value={profile.contact_person_email} editable={isEditing} onChange={(val) => setProfile({ ...profile, contact_person_email: val })} />
      </div>
    </div>
  );
}

// ✅ PERSONAL PROFILE FORM
function PersonalProfileForm() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantProfileApi.getPersonalProfile()
      .then(setProfile)
      .catch(() => alert("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await tenantProfileApi.updatePersonalProfile(profile);
      setProfile(updated);
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      alert("❌ Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-slate-400">Loading profile...</div>;
  if (!profile) return <div className="py-8 text-center text-red-500">No profile found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
            isEditing 
              ? "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Details"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Full Name" value={profile.full_name} editable={isEditing} onChange={(val) => setProfile({ ...profile, full_name: val })} />
        <InputField label="Phone Number" value={profile.phone_number} editable={isEditing} onChange={(val) => setProfile({ ...profile, phone_number: val })} />
        <InputField label="Email Address" value={profile.email} editable={false} onChange={() => {}} />
        <InputField label="Nationality" value={profile.nationality} editable={isEditing} onChange={(val) => setProfile({ ...profile, nationality: val })} />
        <InputField label="ID / Passport Number" value={profile.id_number} editable={isEditing} onChange={(val) => setProfile({ ...profile, id_number: val })} />
      </div>
    </div>
  );
}

// ✅ NEXT OF KIN MANAGER
function NextOfKinManager() {
  const [kinList, setKinList] = useState<NextOfKin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingKin, setEditingKin] = useState<NextOfKin | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<NextOfKin, "id">>({
    full_name: "",
    relationship: "",
    phone_number: "",
    city: "",
  });

  const fetchKin = async () => {
    setLoading(true);
    try {
      const data = await tenantProfileApi.getNextOfKin();
      setKinList(data);
    } catch (error) {
      console.error("Failed to load next of kin", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKin();
  }, []);

  const openAddForm = () => {
    setEditingKin(null);
    setFormData({ full_name: "", relationship: "", phone_number: "", city: "" });
    setShowForm(true);
  };

  const openEditForm = (k: NextOfKin) => {
    setEditingKin(k);
    setFormData({
      full_name: k.full_name,
      relationship: k.relationship,
      phone_number: k.phone_number,
      city: k.city,
    });
    setShowForm(true);
  };

  const handleSaveKin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingKin?.id) {
        await tenantProfileApi.updateNextOfKin(editingKin.id, formData);
      } else {
        await tenantProfileApi.createNextOfKin(formData);
      }
      setShowForm(false);
      fetchKin();
      alert("✅ Next of kin saved!");
    } catch (error) {
      alert("❌ Failed to save next of kin.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKin = async (id: number) => {
    if (!confirm("Are you sure you want to remove this contact?")) return;
    try {
      await tenantProfileApi.deleteNextOfKin(id);
      fetchKin();
      alert("✅ Contact removed.");
    } catch (error) {
      alert("❌ Failed to remove contact.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Emergency Contacts</h2>
        {!showForm && (
          <button 
            onClick={openAddForm}
            className="text-sm font-bold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            + Add Contact
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSaveKin} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h3 className="font-bold text-slate-700">{editingKin ? "Edit Contact" : "Add New Contact"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Relationship</label>
              <input required type="text" value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input required type="text" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
              <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading contacts...</div>
      ) : kinList.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No emergency contacts registered.</p>
          <p className="text-xs text-slate-400 mt-2">Please add a next of kin for security purposes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kinList.map((k) => (
            <div key={k.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-slate-800">
                  {k.full_name} <span className="text-xs font-normal text-slate-500">({k.relationship})</span>
                </p>
                <p className="text-sm text-slate-600">{k.phone_number} • {k.city}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => openEditForm(k)} className="text-xs text-primary font-bold hover:underline">Edit</button>
                <button onClick={() => handleDeleteKin(k.id!)} className="text-xs text-red-500 font-bold hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ PRIVACY-ENFORCED MANAGEMENT CONTACTS
function ManagementContactsView() {
  const [contacts, setContacts] = useState<ManagementContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantProfileApi.getManagementContacts()
      .then(setContacts)
      .catch(() => console.error("Failed to load contacts"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-8 text-center text-slate-400">Loading management contacts...</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-start gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <p className="font-bold">Privacy & Communication Policy</p>
          <p className="text-xs mt-1">
            For security and operational efficiency, direct landlord contact information is kept confidential. Please use the contacts below for all property-related issues, emergencies, or inquiries.
          </p>
        </div>
      </div>

      {contacts.length === 0 ? (
         <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No active management contacts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contacts.map((c) => (
            <div key={c.tenancy_id} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <p className="font-bold text-slate-800">{c.property_name}</p>
                <p className="text-xs text-slate-500">Unit {c.unit_code}</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                    c.management_type === "agency" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                  }`}>
                    {c.management_type === "agency" ? "Managed by Agency" : "On-Site Caretaker"}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-slate-800">{c.contact_name}</p>
                  <p className="text-slate-600 flex items-center gap-2">
                    📞 <a href={`tel:${c.contact_phone}`} className="text-primary font-medium hover:underline">{c.contact_phone}</a>
                  </p>
                  <p className="text-slate-600 flex items-center gap-2">
                    ✉️ <a href={`mailto:${c.contact_email}`} className="text-primary font-medium hover:underline">{c.contact_email}</a>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ REUSABLE INPUT FIELD (UPDATED FOR CONTROLLED STATE)
function InputField({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        disabled={!editable}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
      />
    </div>
  );
}