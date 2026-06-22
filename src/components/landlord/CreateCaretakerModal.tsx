"use client";

import React, { useState } from "react";
import { staffApi, CaretakerPermissions } from "@/api/staff.api";

interface CreateCaretakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCaretakerModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCaretakerModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [permissions, setPermissions] = useState<CaretakerPermissions>({
    can_manage_maintenance: true,
    can_conduct_inspections: true,
    can_view_tenant_contacts: true,
    can_track_utilities: false,
    can_view_financials: false, // Hard-restricted
    can_edit_leases: false, // Hard-restricted
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof CaretakerPermissions) => {
    // Prevent toggling hard-restricted permissions
    if (key === "can_view_financials" || key === "can_edit_leases") return;
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  const handleSubmit = async () => {
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      return alert("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    try {
      await staffApi.createCaretaker({ ...formData, permissions });
      alert(
        "✅ Caretaker account created successfully! You can now share these credentials with them.",
      );
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to create caretaker account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Add New Caretaker
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Create login credentials and define operational boundaries.
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Essential Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Operational Permissions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Define exactly what this caretaker can access. System-critical
              financial and legal permissions are permanently locked for
              security.
            </p>

            <div className="space-y-3">
              <PermissionToggle
                label="Manage Maintenance Requests"
                description="Receive, inspect, and resolve maintenance tickets."
                checked={permissions.can_manage_maintenance}
                onChange={() => handleToggle("can_manage_maintenance")}
              />
              <PermissionToggle
                label="Conduct Property Inspections"
                description="Submit routine inspection reports and document damages."
                checked={permissions.can_conduct_inspections}
                onChange={() => handleToggle("can_conduct_inspections")}
              />
              <PermissionToggle
                label="View Tenant Contact Info"
                description="See phone numbers and emails to coordinate repairs/access."
                checked={permissions.can_view_tenant_contacts}
                onChange={() => handleToggle("can_view_tenant_contacts")}
              />
              <PermissionToggle
                label="Track Utilities"
                description="Log meter readings and report utility irregularities."
                checked={permissions.can_track_utilities}
                onChange={() => handleToggle("can_track_utilities")}
              />

              {/* Hard-Restricted Permissions */}
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg opacity-60 cursor-not-allowed">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      View Financial Records & Ledgers
                    </p>
                    <p className="text-xs text-slate-500">
                      System Restricted: Caretakers cannot access rent or
                      arrears data.
                    </p>
                  </div>
                  <div className="w-10 h-6 bg-slate-300 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg opacity-60 cursor-not-allowed">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Edit Leases & Tenancies
                    </p>
                    <p className="text-xs text-slate-500">
                      System Restricted: Only Landlords/Agencies can modify
                      legal agreements.
                    </p>
                  </div>
                  <div className="w-10 h-6 bg-slate-300 rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Caretaker Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for Toggle Switches
function PermissionToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:border-slate-200 transition-colors">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </div>
  );
}
