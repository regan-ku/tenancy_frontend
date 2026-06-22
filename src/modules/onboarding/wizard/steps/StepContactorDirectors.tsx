"use client";

import React, { useState } from "react";
import {
  useOnboardingWizardStore,
  DirectorData,
} from "@/store/onboardingWizard.store";

// ✅ STRICT VALIDATION HELPERS
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^(\+254|254|0)[17]\d{8}$/.test(phone);
const isValidName = (name: string) => /^[a-zA-Z\s\-']{2,60}$/.test(name);
const isValidID = (id: string) => /^[A-Za-z0-9]{6,20}$/.test(id);

export default function StepContactsOrDirectors() {
  const { formData, updateFormData, userRole, addDirector, removeDirector } =
    useOnboardingWizardStore();
  const isAgency = userRole === "agency";

  const [newDirector, setNewDirector] = useState<Partial<DirectorData>>({
    phone_number: "+254",
    ownership_percentage: "100",
    nationality: "",
    address: "",
  });

  // ✅ Local error state for the Director mini-form
  const [directorError, setDirectorError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleAddDirector = () => {
    setDirectorError(null);

    if (!isValidName(newDirector.full_name || "")) {
      setDirectorError("Invalid name. Use letters and spaces only.");
      return;
    }
    if (!isValidID(newDirector.id_number || "")) {
      setDirectorError("Invalid ID. Must be 6-20 alphanumeric characters.");
      return;
    }
    if (!isValidEmail(newDirector.email || "")) {
      setDirectorError("Please enter a valid email address.");
      return;
    }
    if (!isValidPhone(newDirector.phone_number || "")) {
      setDirectorError(
        "Invalid phone. Use format: +254712345678 or 0712345678.",
      );
      return;
    }
    if (!isValidName(newDirector.nationality || "")) {
      setDirectorError("Invalid nationality. Use letters and spaces only.");
      return;
    }
    if (!newDirector.address || newDirector.address.length < 5) {
      setDirectorError(
        "Please provide a valid residential address (min 5 characters).",
      );
      return;
    }

    const ownership = parseInt(newDirector.ownership_percentage || "0");
    if (isNaN(ownership) || ownership < 1 || ownership > 100) {
      setDirectorError("Ownership percentage must be between 1 and 100.");
      return;
    }

    addDirector({
      id: crypto.randomUUID(),
      full_name: newDirector.full_name!,
      id_number: newDirector.id_number!,
      phone_number: newDirector.phone_number!,
      email: newDirector.email!,
      ownership_percentage: newDirector.ownership_percentage!,
      nationality: newDirector.nationality!,
      address: newDirector.address!,
    });

    setNewDirector({
      phone_number: "+254",
      ownership_percentage: "100",
      full_name: "",
      id_number: "",
      email: "",
      nationality: "",
      address: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          {isAgency ? "Agency Directors" : "Next of Kin"}
        </h2>
        <p className="text-slate-500">
          {isAgency
            ? "Add all legally responsible directors."
            : "Provide emergency contact information."}
        </p>
      </div>

      {isAgency ? (
        <div className="space-y-6">
          {formData.directors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Registered Directors
              </h3>
              {formData.directors.map((d) => (
                <div
                  key={d.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-start"
                >
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-primary-dark text-base">
                      {d.full_name}
                    </p>
                    <p className="text-slate-600">
                      ID: {d.id_number} • {d.ownership_percentage}% Ownership
                    </p>
                    <p className="text-slate-600">
                      {d.phone_number} • {d.email}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {d.nationality} • {d.address}
                    </p>
                  </div>
                  <button
                    onClick={() => removeDirector(d.id!)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-primary-dark text-sm flex items-center gap-2">
              <span className="text-lg">➕</span> Add New Director
            </h4>

            {/* ✅ Director Error Display */}
            {directorError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {directorError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full Legal Name *
                </label>
                <input
                  placeholder="e.g., John Doe"
                  value={newDirector.full_name || ""}
                  onChange={(e) =>
                    setNewDirector({
                      ...newDirector,
                      full_name: e.target.value,
                    })
                  }
                  pattern="^[a-zA-Z\s\-']{2,60}$"
                  title="Letters and spaces only"
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 2. National ID */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  National ID / Passport *
                </label>
                <input
                  placeholder="e.g., 12345678"
                  value={newDirector.id_number || ""}
                  onChange={(e) =>
                    setNewDirector({
                      ...newDirector,
                      id_number: e.target.value,
                    })
                  }
                  pattern="^[A-Za-z0-9]{6,20}$"
                  title="6-20 alphanumeric characters"
                  maxLength={20}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 3. Email */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g., john@example.com"
                  value={newDirector.email || ""}
                  onChange={(e) =>
                    setNewDirector({ ...newDirector, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 4. Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +254712345678"
                  value={newDirector.phone_number || ""}
                  onChange={(e) =>
                    setNewDirector({
                      ...newDirector,
                      phone_number: e.target.value,
                    })
                  }
                  pattern="^(\+254|254|0)[17]\d{8}$"
                  title="Format: +254712345678"
                  maxLength={15}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 5. Nationality (NEW) */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Nationality *
                </label>
                <input
                  placeholder="e.g., Kenyan"
                  value={newDirector.nationality || ""}
                  onChange={(e) =>
                    setNewDirector({
                      ...newDirector,
                      nationality: e.target.value,
                    })
                  }
                  pattern="^[a-zA-Z\s\-']{2,60}$"
                  title="Letters and spaces only"
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 6. Ownership % */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Ownership Percentage *
                </label>
                <input
                  type="number"
                  placeholder="e.g., 50"
                  value={newDirector.ownership_percentage || ""}
                  onChange={(e) =>
                    setNewDirector({
                      ...newDirector,
                      ownership_percentage: e.target.value,
                    })
                  }
                  min="1"
                  max="100"
                  title="Must be between 1 and 100"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                />
              </div>

              {/* 7. Residential Address (NEW) */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Residential Address *
                </label>
                <textarea
                  placeholder="e.g., 123 Main St, Nairobi"
                  value={newDirector.address || ""}
                  onChange={(e) =>
                    setNewDirector({ ...newDirector, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddDirector}
              disabled={
                !newDirector.full_name ||
                !newDirector.id_number ||
                !newDirector.email ||
                !newDirector.phone_number ||
                !newDirector.nationality ||
                !newDirector.address
              }
              className="w-full btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Director to List
            </button>
          </div>

          {formData.directors.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <p className="text-sm text-amber-800 font-medium">
                Action Required: You must add at least one director before you
                can proceed.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Next of Kin Form (Unchanged)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="next_of_kin_name"
              value={formData.next_of_kin_name}
              onChange={handleChange}
              required
              pattern="^[a-zA-Z\s\-']{2,60}$"
              title="Letters and spaces only"
              maxLength={60}
              placeholder="e.g., Jane Doe"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Relationship *
            </label>
            <select
              name="next_of_kin_relationship"
              value={formData.next_of_kin_relationship}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">Select Relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="relative">Other Relative</option>
              <option value="friend">Friend</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City / Town *
            </label>
            <input
              type="text"
              name="next_of_kin_city"
              value={formData.next_of_kin_city}
              onChange={handleChange}
              required
              pattern="^[a-zA-Z\s\-']{2,60}$"
              title="Letters and spaces only"
              maxLength={60}
              placeholder="e.g., Nairobi"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Emergency Contact Phone *
            </label>
            <input
              type="tel"
              name="next_of_kin_phone"
              value={formData.next_of_kin_phone}
              onChange={handleChange}
              required
              pattern="^(\+254|254|0)[17]\d{8}$"
              title="Format: +254712345678 or 0712345678"
              maxLength={15}
              placeholder="e.g., +254722000000"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
