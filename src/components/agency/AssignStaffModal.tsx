"use client";

import React, { useState } from "react";
import { AgencyStaffMember, agencyStaffApi } from "@/api/agencyStaff.api";

interface AssignStaffModalProps {
  staff: AgencyStaffMember;
  onClose: () => void;
  onSave: () => void;
}

// Mock list of delegated properties the agency manages
const mockDelegatedProperties = [
  { id: 2, name: "Kilimani Heights", landlord: "David Miller" },
  { id: 3, name: "Lavington Villas", landlord: "Sarah Connor" },
  { id: 4, name: "Westlands Plaza", landlord: "John Doe" },
  { id: 5, name: "Karen Office Park", landlord: "Bruce Wayne" },
];

export default function AssignStaffModal({
  staff,
  onClose,
  onSave,
}: AssignStaffModalProps) {
  const [selectedProperties, setSelectedProperties] = useState<number[]>(
    staff.assigned_properties.map((p) => p.id),
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleProperty = (id: number) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await agencyStaffApi.assignToProperty(staff.id, selectedProperties);
      onSave();
    } catch (error) {
      alert("Failed to update assignments.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleContext = () => {
    switch (staff.role) {
      case "agent":
        return "This user will handle viewings, marketing, and lead management for the selected properties.";
      case "caretaker":
        return "This user will be responsible for physical maintenance, inspections, and field operations at the selected properties.";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Assign Properties
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Mapping {staff.full_name} to delegated assets.
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Role Context Warning */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>Role Context:</strong> {getRoleContext()}
          </div>

          {/* Property List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Select Delegated Properties
            </p>
            {mockDelegatedProperties.map((prop) => {
              const isSelected = selectedProperties.includes(prop.id);
              return (
                <button
                  key={prop.id}
                  onClick={() => toggleProperty(prop.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800">{prop.name}</p>
                    <p className="text-xs text-slate-500">
                      Owner: {prop.landlord}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
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
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving
              ? "Saving..."
              : `Assign ${selectedProperties.length} Properties`}
          </button>
        </div>
      </div>
    </div>
  );
}
