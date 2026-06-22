"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  agencyPropertiesApi,
  AgencyPropertyDetail,
} from "@/api/agencyProperties.api";
import UnitManagementTab from "@/components/agency/agencyUnitManagementTab";
import TenantsFinancialsTab from "@/components/agency/AgencyFinancialTab";

// ✅ Dropdown Options mapped to backend Enums
const categories = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "hospitality", label: "Hospitality" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land" },
  { value: "mixed_use", label: "Mixed Use" },
];
const subTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "mansion", label: "Mansion" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "office_space", label: "Office Space" },
  { value: "retail_shop", label: "Retail Shop" },
  { value: "warehouse", label: "Warehouse" },
  { value: "airbnb", label: "Airbnb" },
  { value: "hotel", label: "Hotel" },
  { value: "residential_plot", label: "Residential Plot" },
];
const constructionTypes = [
  { value: "concrete", label: "Concrete" },
  { value: "stone", label: "Stone" },
  { value: "steel_frame", label: "Steel Frame" },
  { value: "timber", label: "Timber" },
  { value: "brick", label: "Brick" },
  { value: "mixed", label: "Mixed" },
];
const listingTypes = [
  { value: "rental", label: "Rental" },
  { value: "sale", label: "Sale" },
  { value: "short_stay", label: "Short Stay" },
];

export default function AgencyPropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<AgencyPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ Form State for Editing
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      agencyPropertiesApi.getPropertyDetail(Number(id)).then((data) => {
        setProperty(data);
        setLoading(false);
      });
    }
  }, [id]);

  // Initialize form data when property loads
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.name,
        description: property.description,
        property_category: property.property_category,
        property_sub_type: property.property_sub_type,
        construction_type: property.construction_type,
        number_of_floors: property.number_of_floors,
        total_units_capacity: property.total_units_capacity,
        is_single_unit_property: property.is_single_unit_property,
        has_water: property.has_water,
        has_electricity: property.has_electricity,
        has_internet: property.has_internet,
        has_cctv: property.has_cctv,
        has_elevator: property.has_elevator,
        has_generator: property.has_generator,
        has_gym: property.has_gym,
        has_swimming_pool: property.has_swimming_pool,
        allows_pets: property.allows_pets,
        parking_spaces: property.parking_spaces,
        location_details: property.location_details || {},
        listing_type: property.listing_type,
        is_published: property.is_published,
        is_active: property.is_active,
      });
    }
  }, [property]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await agencyPropertiesApi.updateProperty(Number(id), formData);
      alert("✅ Property updated successfully!");
      setIsEditing(false);
      // Re-fetch to get updated data
      const updatedData = await agencyPropertiesApi.getPropertyDetail(
        Number(id),
      );
      setProperty(updatedData);
    } catch (error) {
      alert("Failed to update property. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-400">
        Loading property data...
      </div>
    );
  if (!property)
    return (
      <div className="p-8 text-center text-red-500">
        Property not found or access denied.
      </div>
    );

  const availableTabs = [];
  if (property.permissions.can_edit_overview)
    availableTabs.push({ key: "overview", label: "Overview & Settings" });
  if (property.permissions.can_manage_units)
    availableTabs.push({ key: "units", label: "Unit Management" });
  if (property.permissions.can_view_tenants)
    availableTabs.push({ key: "tenants", label: "Tenants & Financials" });
  if (availableTabs.length === 0)
    availableTabs.push({
      key: "readonly",
      label: "Property Snapshot (View Only)",
    });

  if (!availableTabs.find((t) => t.key === activeTab))
    setActiveTab(availableTabs[0].key);

  return (
    <div className="space-y-6">
      {/* Delegation Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center gap-3 ${
          property.ownership_type === "owned"
            ? "bg-primary/5 border-primary/20"
            : "bg-orange-50 border-orange-200"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
            property.ownership_type === "owned" ? "bg-primary" : "bg-orange-500"
          }`}
        >
          {property.ownership_type === "owned" ? "🏢" : "🤝"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">
            {property.ownership_type === "owned"
              ? "Agency Owned Asset"
              : `Delegated by ${property.landlord_name}`}
          </p>
          <p className="text-xs text-slate-500">
            {property.ownership_type === "owned"
              ? "You have full administrative control."
              : `Scope: ${property.delegation_type?.replace("_", " ").toUpperCase()} | Permissions enforced.`}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {property.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {property.location} • {property.total_units} Units Capacity
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        {/* COMPREHENSIVE OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Edit Mode Toggle */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Property Configuration
              </h2>
              {property.permissions.can_edit_overview && (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
                    >
                      Edit Property
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Property Title"
                  value={formData.title}
                  onChange={(v) => setFormData({ ...formData, title: v })}
                  disabled={!isEditing}
                />
                <FormField
                  label="Category"
                  value={formData.property_category}
                  onChange={(v) =>
                    setFormData({ ...formData, property_category: v })
                  }
                  disabled={!isEditing}
                  type="select"
                  options={categories}
                />
                <FormField
                  label="Sub-Type"
                  value={formData.property_sub_type}
                  onChange={(v) =>
                    setFormData({ ...formData, property_sub_type: v })
                  }
                  disabled={!isEditing}
                  type="select"
                  options={subTypes}
                />
                <FormField
                  label="Construction Type"
                  value={formData.construction_type}
                  onChange={(v) =>
                    setFormData({ ...formData, construction_type: v })
                  }
                  disabled={!isEditing}
                  type="select"
                  options={constructionTypes}
                />
              </div>
              <FormField
                label="Description"
                value={formData.description}
                onChange={(v) => setFormData({ ...formData, description: v })}
                disabled={!isEditing}
                type="textarea"
              />
            </div>

            {/* Section 2: Structure & Capacity */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Structure & Capacity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Number of Floors"
                  value={formData.number_of_floors}
                  onChange={(v) =>
                    setFormData({ ...formData, number_of_floors: Number(v) })
                  }
                  disabled={!isEditing}
                  type="number"
                />
                <FormField
                  label="Total Units Capacity"
                  value={formData.total_units_capacity}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      total_units_capacity: Number(v),
                    })
                  }
                  disabled={!isEditing}
                  type="number"
                />
                <FormField
                  label="Parking Spaces"
                  value={formData.parking_spaces}
                  onChange={(v) =>
                    setFormData({ ...formData, parking_spaces: Number(v) })
                  }
                  disabled={!isEditing}
                  type="number"
                />
              </div>
              <CheckboxField
                label="Is this a single unit property? (e.g., Bungalow, Plot)"
                checked={formData.is_single_unit_property}
                onChange={(v) =>
                  setFormData({ ...formData, is_single_unit_property: v })
                }
                disabled={!isEditing}
              />
            </div>

            {/* Section 3: Amenities */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <CheckboxField
                  label="Water"
                  checked={formData.has_water}
                  onChange={(v) => setFormData({ ...formData, has_water: v })}
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Electricity"
                  checked={formData.has_electricity}
                  onChange={(v) =>
                    setFormData({ ...formData, has_electricity: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Internet/Wi-Fi"
                  checked={formData.has_internet}
                  onChange={(v) =>
                    setFormData({ ...formData, has_internet: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="CCTV Security"
                  checked={formData.has_cctv}
                  onChange={(v) => setFormData({ ...formData, has_cctv: v })}
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Elevator"
                  checked={formData.has_elevator}
                  onChange={(v) =>
                    setFormData({ ...formData, has_elevator: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Backup Generator"
                  checked={formData.has_generator}
                  onChange={(v) =>
                    setFormData({ ...formData, has_generator: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Gym"
                  checked={formData.has_gym}
                  onChange={(v) => setFormData({ ...formData, has_gym: v })}
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Swimming Pool"
                  checked={formData.has_swimming_pool}
                  onChange={(v) =>
                    setFormData({ ...formData, has_swimming_pool: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Allows Pets"
                  checked={formData.allows_pets}
                  onChange={(v) => setFormData({ ...formData, allows_pets: v })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Section 4: Location */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Estate / Neighborhood"
                  value={formData.location_details?.estate}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        estate: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <FormField
                  label="Street / Road"
                  value={formData.location_details?.street}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        street: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <FormField
                  label="City / Town"
                  value={formData.location_details?.city}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        city: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <FormField
                  label="County"
                  value={formData.location_details?.county}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        county: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <FormField
                  label="Region"
                  value={formData.location_details?.region}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        region: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <FormField
                  label="Postal Code"
                  value={formData.location_details?.postal_code}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      location_details: {
                        ...formData.location_details,
                        postal_code: v,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
                <div className="md:col-span-2">
                  <FormField
                    label="Nearby Landmark"
                    value={formData.location_details?.landmark}
                    onChange={(v) =>
                      setFormData({
                        ...formData,
                        location_details: {
                          ...formData.location_details,
                          landmark: v,
                        },
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Marketplace */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Marketplace & Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Listing Type"
                  value={formData.listing_type}
                  onChange={(v) =>
                    setFormData({ ...formData, listing_type: v })
                  }
                  disabled={!isEditing}
                  type="select"
                  options={listingTypes}
                />
              </div>
              <div className="flex flex-col gap-3">
                <CheckboxField
                  label="Published to Public Marketplace"
                  checked={formData.is_published}
                  onChange={(v) =>
                    setFormData({ ...formData, is_published: v })
                  }
                  disabled={!isEditing}
                />
                <CheckboxField
                  label="Property is Active (Wizard Complete)"
                  checked={formData.is_active}
                  onChange={(v) => setFormData({ ...formData, is_active: v })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ UNIT MANAGEMENT TAB */}
        {activeTab === "units" && <UnitManagementTab propertyId={Number(id)} />}

        {/* ✅ TENANTS & FINANCIALS TAB */}
        {activeTab === "tenants" && (
          <TenantsFinancialsTab propertyId={Number(id)} />
        )}

        {/* READONLY TAB */}
        {activeTab === "readonly" && (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-3xl">
              👁️
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              View-Only Access
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              The landlord has granted your agency View-Only access. You cannot
              edit details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE FORM COMPONENTS (FULLY TYPED)
// ==========================================

// ✅ FIX: Explicitly defined interfaces to resolve 'implicit any' errors
interface FormFieldProps {
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  type?: "text" | "number" | "textarea" | "select";
  options?: { value: string; label: string }[];
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  options = [],
}: FormFieldProps) {
  if (type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          {label}
        </label>
        <textarea
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-primary outline-none resize-none"
        />
      </div>
    );
  }
  if (type === "select") {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
          {label}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-primary outline-none bg-white"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            type === "number"
              ? e.target.value
                ? parseInt(e.target.value)
                : 0
              : e.target.value,
          )
        }
        disabled={disabled}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500 focus:ring-2 focus:ring-primary outline-none"
      />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: CheckboxFieldProps) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        disabled
          ? "bg-slate-50 border-slate-200 cursor-not-allowed"
          : "bg-white border-slate-200 hover:border-primary/50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}
