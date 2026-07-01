"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AgencyStaffMember,
  agencyStaffApi,
  AccessibleProperty,
} from "@/api/agencyStaff.api";

interface AssignStaffModalProps {
  staff: AgencyStaffMember;
  onClose: () => void;
  onSave: () => void;
}

export default function AssignStaffModal({
  staff,
  onClose,
  onSave,
}: AssignStaffModalProps) {
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [accessibleProperties, setAccessibleProperties] = useState<
    AccessibleProperty[]
  >([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ NEW: State for the search input
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ UPDATED: Fetch properties filtered by the staff's role
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const properties = await agencyStaffApi.getAccessibleProperties(
          staff.role,
        );
        setAccessibleProperties(properties);
      } catch (err) {
        console.error("Failed to fetch properties", err);
        setError("Failed to load properties.");
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, [staff.role]);

  // ✅ NEW: Memoized filtering for instant search performance
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return accessibleProperties;
    return accessibleProperties.filter((prop) =>
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [accessibleProperties, searchTerm]);

  const toggleProperty = (id: number) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (selectedProperties.length === 0) {
      setError("Please select at least one property.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await agencyStaffApi.assignStaffToProperties(
        staff.id,
        staff.role,
        selectedProperties,
      );
      onSave();
    } catch (err: any) {
      console.error("Failed to assign staff", err);
      const errMsg =
        err.response?.data?.error ||
        "Failed to update assignments. Ensure you have permission.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleContext = () => {
    switch (staff.role) {
      case "property_manager":
        return "This user will oversee operations, approve applications, and manage staff for the selected properties.";
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
              Mapping {staff.full_name} to your managed assets.
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

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Property List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Select Properties to Assign
            </p>

            {/* ✅ NEW: Search Input (Only shows if properties exist) */}
            {accessibleProperties.length > 0 && (
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search properties by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
                />
                <svg
                  className="absolute left-3 top-3 w-4 h-4 text-slate-400"
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
              </div>
            )}

            {loadingProperties ? (
              <div className="text-center py-8 text-slate-400">
                Loading properties...
              </div>
            ) : accessibleProperties.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>
                  No available properties found for the role of{" "}
                  <strong>{staff.role.replace("_", " ")}</strong>.
                </p>
                <p className="text-xs mt-2">
                  All your managed properties may already have a staff member
                  with this role assigned.
                </p>
              </div>
            ) : filteredProperties.length === 0 ? (
              // ✅ NEW: Empty Search State
              <div className="text-center py-8 text-slate-400">
                <p>
                  No properties matching "<strong>{searchTerm}</strong>" found.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-primary font-bold hover:underline mt-2"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredProperties.map((prop) => {
                const isSelected = selectedProperties.includes(prop.id);
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => toggleProperty(prop.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-800">{prop.title}</p>
                      <p className="text-xs text-slate-500">ID: {prop.id}</p>
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
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || loadingProperties}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              `Assign ${selectedProperties.length} Properties`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
