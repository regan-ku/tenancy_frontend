"use client";

import React from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";

export default function StepLocation() {
  const { formData, updateFormData } = usePropertyWizardStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update the nested 'location' object in the store
    updateFormData({
      location: {
        ...formData.location,
        [name]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Location Details
        </h2>
        <p className="text-slate-500">
          Where is the property located? (City, County, and a Nearby Landmark
          are required).
        </p>

        {/* ✅ CLIENT EXPLANATION: Explains why we need the location & landmark */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Why do we need this?
            </p>
            <p className="text-sm text-blue-700">
              We use your address and nearby landmark to automatically generate
              precise GPS coordinates. This ensures your property is accurately
              placed on the map and easily discoverable by tenants and buyers
              searching in your area.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estate / Neighborhood */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Estate / Neighborhood
          </label>
          <input
            type="text"
            name="estate"
            value={formData.location.estate || ""}
            onChange={handleChange}
            placeholder="e.g., Kilimani, Westlands"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* Street / Road */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Street / Road
          </label>
          <input
            type="text"
            name="street"
            value={formData.location.street || ""}
            onChange={handleChange}
            placeholder="e.g., Argwings Kodhek Rd"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* City (Required) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City / Town *
          </label>
          <input
            type="text"
            name="city"
            value={formData.location.city || ""}
            onChange={handleChange}
            required
            placeholder="e.g., Nairobi"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* County (Required) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            County / State *
          </label>
          <input
            type="text"
            name="county"
            value={formData.location.county || ""}
            onChange={handleChange}
            required
            placeholder="e.g., Nairobi County"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.location.postal_code || ""}
            onChange={handleChange}
            placeholder="e.g., 00100"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* ✅ Landmark (Required for GPS Generation) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nearby Landmark *
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.location.landmark || ""}
            onChange={handleChange}
            required
            placeholder="e.g., Opposite Nairobi Hospital, Next to Total Petrol Station"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            This helps our system pinpoint the exact GPS location for map
            discovery.
          </p>
        </div>
      </div>
    </div>
  );
}
