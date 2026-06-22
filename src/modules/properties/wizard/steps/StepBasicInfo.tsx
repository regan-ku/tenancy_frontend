"use client";

import React, { useEffect } from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";
import {
  PROPERTY_CATEGORIES,
  PROPERTY_SUB_TYPES,
  CONSTRUCTION_TYPES,
  SINGLE_UNIT_SUB_TYPES,
} from "@/config/propertyEnums";

export default function StepBasicInfo() {
  const { formData, updateFormData } = usePropertyWizardStore();

  // ✅ SMART LOGIC: Auto-toggle single unit property based on sub-type
  useEffect(() => {
    const shouldSkipUnits = SINGLE_UNIT_SUB_TYPES.includes(
      formData.property_sub_type,
    );
    if (shouldSkipUnits && !formData.is_single_unit_property) {
      updateFormData({ is_single_unit_property: true });
    } else if (
      !shouldSkipUnits &&
      formData.is_single_unit_property &&
      formData.property_sub_type !== ""
    ) {
      // Optional: Uncheck it if they switch back to Apartment
      updateFormData({ is_single_unit_property: false });
    }
  }, [formData.property_sub_type]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    updateFormData({ [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Basic Property Information
        </h2>
        <p className="text-slate-500">
          Tell us about the property you want to list.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Sunrise Apartments, Kilimani"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Category *
          </label>
          <select
            name="property_category"
            value={formData.property_category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            {PROPERTY_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Sub-Type *
          </label>
          <select
            name="property_sub_type"
            value={formData.property_sub_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            <option value="">Select Sub-Type</option>
            {PROPERTY_SUB_TYPES.map((sub) => (
              <option key={sub.value} value={sub.value}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>

        {/* Construction Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Construction Type
          </label>
          <select
            name="construction_type"
            value={formData.construction_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            {CONSTRUCTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Smart Toggle: Single Unit Property */}
        <div className="flex items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <input
            type="checkbox"
            id="is_single_unit_property"
            name="is_single_unit_property"
            checked={formData.is_single_unit_property}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="is_single_unit_property"
            className="ml-3 text-sm font-medium text-primary-dark cursor-pointer"
          >
            This is a Single-Unit Property (e.g., Mansion, Plot). <br />
            <span className="text-xs text-slate-500 font-normal">
              Skip Unit Group creation in Step 4.
            </span>
          </label>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the property, its surroundings, and key features..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
