"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  landlordStaffApi,
  LandlordStaffMember,
  AccessibleProperty,
} from "@/api/LandlordStaff.api";

interface AssignCaretakerModalProps {
  caretaker: LandlordStaffMember;
  onClose: () => void;
  onSave: () => void;
}

export default function AssignCaretakerModal({
  caretaker,
  onClose,
  onSave,
}: AssignCaretakerModalProps) {
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [accessibleProperties, setAccessibleProperties] = useState<
    AccessibleProperty[]
  >([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const properties = await landlordStaffApi.getMyProperties();
        setAccessibleProperties(properties);
      } catch (err) {
        console.error("Failed to fetch properties", err);
        setError("Failed to load your properties.");
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, []);

  // Memoized filtering for instant search performance
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
      await landlordStaffApi.assignCaretakerToProperties(
        caretaker.id,
        selectedProperties,
      );
      onSave();
    } catch (err: any) {
      console.error("Failed to assign caretaker", err);
      const errMsg =
        err.response?.data?.error || "Failed to update assignments.";
      setError(errMsg);
    } finally {
      setIsSaving(false);
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
              Granting {caretaker.full_name} access to your properties.
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
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
            <strong>Role Context:</strong> As a caretaker, this user will be
            responsible for physical maintenance, inspections, and field
            operations at the selected properties.
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Select Properties to Assign
            </p>

            {/* Search Input */}
            {accessibleProperties.length > 0 && (
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search your properties..."
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
                Loading your properties...
              </div>
            ) : accessibleProperties.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>You haven't registered any properties yet.</p>
              </div>
            ) : filteredProperties.length === 0 ? (
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
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredProperties.map((prop) => {
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
                        <p className="text-xs text-slate-500">
                          Property ID: {prop.id}
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
            disabled={
              isSaving || loadingProperties || selectedProperties.length === 0
            }
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
