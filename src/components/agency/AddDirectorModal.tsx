"use client";

import React, { useState, useEffect } from "react";
import {
  agenciesApi,
  AgencyDirector,
  CreateDirectorPayload,
} from "@/api/agencies.api";

// ✅ UPDATED PROPS: Added optional 'director' prop
interface DirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (director: AgencyDirector) => void;
  agencyId: number;
  director?: AgencyDirector | null;
}

export default function DirectorModal({
  isOpen,
  onClose,
  onSuccess,
  agencyId,
  director,
}: DirectorModalProps) {
  const isEditing = !!director;

  const [formData, setFormData] = useState<CreateDirectorPayload>({
    full_name: "",
    national_id: "",
    passport_number: "",
    email: "",
    phone_number: "",
    nationality: "Kenyan",
    address: "",
    ownership_percentage: 0,
    is_primary_director: false,
  });

  const [idType, setIdType] = useState<"national" | "passport">("national");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ SYNC FORM DATA: Populate form when editing, reset when adding
  useEffect(() => {
    if (isOpen) {
      if (director) {
        setFormData({
          full_name: director.full_name,
          national_id: director.national_id || "",
          passport_number: director.passport_number || "",
          email: director.email,
          phone_number: director.phone_number,
          nationality: director.nationality,
          address: director.address,
          ownership_percentage: director.ownership_percentage,
          is_primary_director: director.is_primary_director,
        });
        // Auto-select the correct ID tab based on existing data
        setIdType(director.passport_number ? "passport" : "national");
      } else {
        // Reset form for adding new
        setFormData({
          full_name: "",
          national_id: "",
          passport_number: "",
          email: "",
          phone_number: "",
          nationality: "Kenyan",
          address: "",
          ownership_percentage: 0,
          is_primary_director: false,
        });
        setIdType("national");
      }
    }
  }, [director, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.address
    ) {
      return alert(
        "Please fill in all required fields including Residential Address.",
      );
    }
    if (
      formData.ownership_percentage <= 0 ||
      formData.ownership_percentage > 100
    ) {
      return alert("Ownership percentage must be between 1% and 100%.");
    }

    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };

      // Handle ID constraint (only one can be sent to backend)
      if (idType === "national") {
        payload.national_id = formData.national_id;
        delete payload.passport_number;
      } else {
        payload.passport_number = formData.passport_number;
        delete payload.national_id;
      }

      let resultDirector;
      if (isEditing) {
        // ✅ UPDATE EXISTING DIRECTOR
        resultDirector = await agenciesApi.updateDirector(
          agencyId,
          director!.id,
          payload,
        );
      } else {
        // ✅ CREATE NEW DIRECTOR
        resultDirector = await agenciesApi.addDirector(agencyId, payload);
      }

      onSuccess(resultDirector);
    } catch (error: any) {
      console.error(
        `Failed to ${isEditing ? "update" : "add"} director:`,
        error,
      );
      const errors = error?.response?.data;
      if (errors && typeof errors === "object") {
        const errorMessages = Object.entries(errors)
          .map(
            ([field, messages]: [string, any]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
          )
          .join("\n");
        alert(`❌ Validation failed:\n${errorMessages}`);
      } else {
        alert(
          `Failed to ${isEditing ? "update" : "add"} director. Please check your details.`,
        );
      }
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
              {isEditing ? "Edit Director Details" : "Add New Director"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing
                ? "Update the legal representative's information."
                : "Register a legal representative for the agency."}
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
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+2547..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Residential Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
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
                type="button"
                onClick={() => setIdType("national")}
                className={`flex-1 py-2.5 rounded-lg border font-bold text-sm transition-all ${idType === "national" ? "bg-primary/5 border-primary text-primary" : "border-slate-200 text-slate-500"}`}
              >
                National ID
              </button>
              <button
                type="button"
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
                    placeholder="7 or 8 digits"
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

            {/* ✅ REMOVED: Document Upload Placeholder as requested */}
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
              : isEditing
                ? "Update Director"
                : "Add Director & Submit for Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
