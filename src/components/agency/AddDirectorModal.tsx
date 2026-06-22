"use client";

import React, { useState } from "react";
import {
  agenciesApi,
  AgencyDirector,
  CreateDirectorPayload,
} from "@/api/agencies.api";

interface AddDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (director: AgencyDirector) => void;
}

export default function AddDirectorModal({
  isOpen,
  onClose,
  onSuccess,
}: AddDirectorModalProps) {
  const [formData, setFormData] = useState<CreateDirectorPayload>({
    full_name: "",
    national_id: "",
    passport_number: "",
    email: "",
    phone: "",
    nationality: "Kenyan",
    ownership_percentage: 0,
    is_primary_director: false,
  });

  const [idType, setIdType] = useState<"national" | "passport">("national");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.phone) {
      return alert("Please fill in all required fields.");
    }
    if (
      formData.ownership_percentage <= 0 ||
      formData.ownership_percentage > 100
    ) {
      return alert("Ownership percentage must be between 1% and 100%.");
    }

    setIsSubmitting(true);
    try {
      // Mocking the API response for UI demonstration
      const newDirector: AgencyDirector = {
        id: Date.now(),
        full_name: formData.full_name,
        national_id: idType === "national" ? formData.national_id : null,
        passport_number:
          idType === "passport" ? formData.passport_number : null,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        ownership_percentage: formData.ownership_percentage,
        is_primary_director: formData.is_primary_director,
        verification_status: "pending",
        created_at: new Date().toISOString().split("T")[0],
      };

      // In production: await agenciesApi.addDirector(agencyId, formData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      onSuccess(newDirector);
    } catch (error) {
      alert("Failed to add director.");
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
              Add New Director
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Register a legal representative for the agency.
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
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* ID Verification Section */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Legal Identification
            </h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setIdType("national")}
                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm transition-all ${idType === "national" ? "bg-primary/5 border-primary text-primary" : "border-slate-200 text-slate-500"}`}
              >
                National ID
              </button>
              <button
                onClick={() => setIdType("passport")}
                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm transition-all ${idType === "passport" ? "bg-primary/5 border-primary text-primary" : "border-slate-200 text-slate-500"}`}
              >
                Passport
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {idType === "national" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    National ID Number *
                  </label>
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* Document Upload Placeholder */}
            <div className="mt-4 border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
              <svg
                className="w-8 h-8 mx-auto text-slate-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-bold text-slate-700">
                Upload {idType === "national" ? "National ID" : "Passport"} Scan
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF, JPG, or PNG (Max 5MB)
              </p>
            </div>
          </div>

          {/* Ownership & Role Section */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Ownership & Agency Role
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Ownership Percentage (%) *
                </label>
                <input
                  type="number"
                  name="ownership_percentage"
                  min="0"
                  max="100"
                  value={formData.ownership_percentage}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_primary_director"
                    checked={formData.is_primary_director}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Designate as Primary Director
                  </span>
                </label>
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
            {isSubmitting
              ? "Saving..."
              : "Add Director & Submit for Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
