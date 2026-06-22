"use client";

import React from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";

export default function StepStructure() {
  const { formData, updateFormData, error } = usePropertyWizardStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Convert empty string to 0 for number inputs
    const val =
      type === "checkbox" ? checked : value === "" ? 0 : Number(value);
    updateFormData({ [name]: val });
  };

  const amenities = [
    { key: "has_water", label: "Running Water", icon: "💧" },
    { key: "has_electricity", label: "Electricity", icon: "⚡" },
    { key: "has_internet", label: "Internet / WiFi", icon: "📶" },
    { key: "has_cctv", label: "CCTV Security", icon: "📹" },
    { key: "has_elevator", label: "Elevator / Lift", icon: "🛗" },
    { key: "has_generator", label: "Backup Generator", icon: "🔋" },
    { key: "has_gym", label: "Gym / Fitness Center", icon: "🏋️" },
    { key: "has_swimming_pool", label: "Swimming Pool", icon: "🏊" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Structure & Amenities
        </h2>
        <p className="text-slate-500">
          Tell us about the building's capacity and available features.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Numeric Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total Floors
          </label>
          <input
            type="number"
            name="number_of_floors"
            value={formData.number_of_floors}
            onChange={handleChange}
            min={1}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total Unit Capacity *
          </label>
          <input
            type="number"
            name="total_units_capacity"
            value={formData.total_units_capacity}
            onChange={handleChange}
            min={0}
            placeholder="e.g., 24"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Parking Spaces
          </label>
          <input
            type="number"
            name="parking_spaces"
            value={formData.parking_spaces}
            onChange={handleChange}
            min={0}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Amenities Grid */}
      <div>
        <h3 className="text-lg font-semibold text-primary-dark mb-4">
          Available Amenities
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {amenities.map((item) => (
            <label
              key={item.key}
              className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                (formData as any)[item.key]
                  ? "border-secondary bg-secondary/10 text-primary-dark"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/50"
              }`}
            >
              <input
                type="checkbox"
                name={item.key}
                checked={(formData as any)[item.key] || false}
                onChange={handleChange}
                className="hidden"
              />
              <span className="text-xl mr-2">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pets Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="font-medium text-slate-700">Allows Pets</p>
          <p className="text-sm text-slate-500">
            Tenants are permitted to keep domestic animals
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="allows_pets"
            checked={formData.allows_pets}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );
}
