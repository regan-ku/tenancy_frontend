"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  agencyPropertiesApi,
  AgencyPropertyDetail,
} from "@/api/agencyProperties.api";
import {
  agencyUnitManagementApi,
  UnitGroup,
  UnitMedia,
} from "@/api/agencyUnitManagement.api";
import UnitManagementTab from "@/components/agency/agencyUnitManagementTab";
import TenantsFinancialsTab from "@/components/agency/AgencyFinancialTab";

// Dropdown Options mapped to backend Enums
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
  const router = useRouter();
  const [property, setProperty] = useState<AgencyPropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      agencyPropertiesApi
        .getPropertyDetail(Number(id))
        .then((data) => {
          setProperty(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      agencyUnitManagementApi
        .getUnitGroups(Number(id))
        .then(setUnitGroups)
        .catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "overview" && id) {
      agencyUnitManagementApi
        .getUnitGroups(Number(id))
        .then(setUnitGroups)
        .catch(console.error);
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.name || (property as any).title || "",
        description: property.description || "",
        property_category: property.property_category || "",
        property_sub_type: property.property_sub_type || "",
        construction_type: property.construction_type || "",
        number_of_floors: property.number_of_floors || 0,
        total_units_capacity: property.total_units_capacity || 0,
        is_single_unit_property: property.is_single_unit_property || false,
        has_water: property.has_water || false,
        has_electricity: property.has_electricity || false,
        has_internet: property.has_internet || false,
        has_cctv: property.has_cctv || false,
        has_elevator: property.has_elevator || false,
        has_generator: property.has_generator || false,
        has_gym: property.has_gym || false,
        has_swimming_pool: property.has_swimming_pool || false,
        allows_pets: property.allows_pets || false,
        parking_spaces: property.parking_spaces || 0,
        location_details: property.location_details || {},
        listing_type: property.listing_type || "rental",
        is_published: property.is_published || false,
      });
    }
  }, [property]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = { ...formData };

      // ✅ BULLETPROOF LOCATION MAPPING
      if (
        payload.location_details &&
        typeof payload.location_details === "object"
      ) {
        payload.location = { ...payload.location_details };
        delete payload.location_details;
      }

      console.log("🚀 SAVING PAYLOAD:", payload); // Debug log to verify what is being sent

      await agencyPropertiesApi.updateProperty(Number(id), payload);
      alert("✅ Property updated successfully!");
      setIsEditing(false);

      const updatedData = await agencyPropertiesApi.getPropertyDetail(
        Number(id),
      );
      setProperty(updatedData);
      agencyUnitManagementApi.getUnitGroups(Number(id)).then(setUnitGroups);
    } catch (error: any) {
      console.error("Property update failed:", error);
      const backendErrors = error?.response?.data;
      if (backendErrors && typeof backendErrors === "object") {
        const errorMessages = Object.entries(backendErrors)
          .map(
            ([field, messages]: [string, any]) =>
              `${field === "detail" || field === "error" ? "" : field + ": "}${Array.isArray(messages) ? messages.join(", ") : messages}`,
          )
          .join("\n");
        setSaveError(errorMessages);
        alert(`❌ Save failed:\n${errorMessages}`);
      } else {
        setSaveError("Failed to update property.");
        alert("Failed to update property. Check console for details.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const availableTabs: { key: string; label: string }[] = [];
  if (property) {
    if (property.permissions?.can_edit_overview)
      availableTabs.push({ key: "overview", label: "Overview & Settings" });
    if (property.permissions?.can_manage_units)
      availableTabs.push({ key: "units", label: "Unit Management" });
    availableTabs.push({ key: "media", label: "Media & Gallery" });
    if (property.permissions?.can_view_tenants)
      availableTabs.push({ key: "tenants", label: "Tenants & Financials" });
    if (availableTabs.length === 0)
      availableTabs.push({
        key: "readonly",
        label: "Property Snapshot (View Only)",
      });
  }

  useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.find((t) => t.key === activeTab)
    )
      setActiveTab(availableTabs[0].key);
  }, [availableTabs, activeTab]);

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

  return (
    <div className="space-y-6">
      {/* Delegation Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center gap-3 ${property.ownership_type === "owned" ? "bg-primary/5 border-primary/20" : "bg-orange-50 border-orange-200"}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${property.ownership_type === "owned" ? "bg-primary" : "bg-orange-500"}`}
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
              : `Scope: ${property.delegation_type?.replace("_", " ").toUpperCase() || "MANAGEMENT"} | Permissions enforced.`}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {property.name || formData.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {property.location} • {property.total_units} Units Capacity
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Property Configuration
              </h2>
              {property.permissions?.can_edit_overview && (
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setSaveError(null);
                        }}
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

            {saveError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <strong>Save Error:</strong>
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {saveError}
                </pre>
              </div>
            )}

            {/* Basic Information */}
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

            {/* Structure & Capacity */}
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

            {/* Unit Groups Overview */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase">
                  Unit Groups & Inventory
                </h3>
                {property.permissions?.can_manage_units && (
                  <button
                    onClick={() =>
                      router.push(`/properties/${id}/wizard?step=4`)
                    }
                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 flex items-center gap-1"
                  >
                    + Add Unit Group
                  </button>
                )}
              </div>
              {unitGroups.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">
                    No unit groups defined yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center hover:border-primary/50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {group.name}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {group.unit_type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {(group as any).actual_units_count !== undefined
                            ? (group as any).actual_units_count
                            : group.units_count || group.capacity || 0}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
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

            {/* ✅ Location Details & Map (FIXED) */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-100 pb-2">
                Location Details & Map
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

              {/* ✅ SAFE MAP EXTRACTION & PIN GENERATION */}
              {(() => {
                // Safely parse coordinates from backend response
                const rawLat = formData.location_details?.latitude;
                const rawLon = formData.location_details?.longitude;
                const lat = rawLat ? parseFloat(String(rawLat)) : NaN;
                const lon = rawLon ? parseFloat(String(rawLon)) : NaN;
                const hasCoords = !isNaN(lat) && !isNaN(lon);

                if (hasCoords) {
                  // Calculate bounding box for the map embed
                  const bboxLonMin = (lon - 0.005).toFixed(5);
                  const bboxLatMin = (lat - 0.005).toFixed(5);
                  const bboxLonMax = (lon + 0.005).toFixed(5);
                  const bboxLatMax = (lat + 0.005).toFixed(5);

                  // OpenStreetMap embed URL with marker pin
                  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxLonMin}%2C${bboxLatMin}%2C${bboxLonMax}%2C${bboxLatMax}&layer=mapnik&marker=${lat}%2C${lon}`;

                  return (
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Property Location Map
                      </label>
                      <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={mapUrl}
                          title="Property Location Map"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        📍 Exact Coordinates: {lat.toFixed(5)}, {lon.toFixed(5)}{" "}
                        (Auto-generated by Geo-Search Service)
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center">
                      <p className="text-sm text-slate-500">
                        📍 Map coordinates not yet available.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        The geo-search service will auto-generate the pin once
                        the address (City, County, Estate) is saved.
                      </p>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Marketplace & Status */}
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
                  checked={formData.is_published || false}
                  onChange={(v) =>
                    setFormData({ ...formData, is_published: v })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "units" && (
          <UnitManagementTab
            propertyId={Number(id)}
            canEdit={property.permissions?.can_edit_overview}
            maxFloors={property.number_of_floors || 0}
          />
        )}
        {activeTab === "media" && (
          <PropertyMediaHub
            propertyId={Number(id)}
            currentPropertyCover={property.cover_photo}
            canEdit={property.permissions?.can_edit_overview || false}
            onPropertyCoverChange={(newUrl) =>
              setProperty({ ...property, cover_photo: newUrl })
            }
          />
        )}
        {activeTab === "tenants" && (
          <TenantsFinancialsTab propertyId={Number(id)} />
        )}
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
// MEDIA HUB (Property + Unit Groups)
// ==========================================
function PropertyMediaHub({
  propertyId,
  currentPropertyCover,
  canEdit,
  onPropertyCoverChange,
}: {
  propertyId: number;
  currentPropertyCover: string;
  canEdit: boolean;
  onPropertyCoverChange: (url: string) => void;
}) {
  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [allMedia, setAllMedia] = useState<UnitMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPropertyMedia, setUploadingPropertyMedia] = useState(false);
  const [editingGroupCoverId, setEditingGroupCoverId] = useState<number | null>(
    null,
  );
  const [uploadingGroupMediaId, setUploadingGroupMediaId] = useState<
    number | null
  >(null);
  const propertyCoverInputRef = useRef<HTMLInputElement>(null);
  const propertyMediaInputRef = useRef<HTMLInputElement>(null);
  const groupCoverInputRef = useRef<HTMLInputElement>(null);
  const groupMediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, mediaData] = await Promise.all([
        agencyUnitManagementApi.getUnitGroups(propertyId),
        agencyUnitManagementApi.getPropertyMedia(propertyId),
      ]);
      setUnitGroups(groupsData);
      setAllMedia(mediaData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyCoverChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const newUrl = await agencyPropertiesApi.updateCoverPhoto(
        propertyId,
        e.target.files[0],
      );
      onPropertyCoverChange(newUrl);
      alert("✅ Property cover updated!");
    } catch (error) {
      alert("Failed to update property cover.");
    } finally {
      if (propertyCoverInputRef.current)
        propertyCoverInputRef.current.value = "";
    }
  };

  const handlePropertyMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadingPropertyMedia(true);
    try {
      for (const file of files) {
        const mediaType = file.type.startsWith("video") ? "video" : "image";
        await agencyPropertiesApi.uploadPropertyMedia(
          propertyId,
          file,
          mediaType,
        );
      }
      await loadData();
    } catch (error) {
      alert("Failed to upload property media.");
    } finally {
      setUploadingPropertyMedia(false);
      if (propertyMediaInputRef.current)
        propertyMediaInputRef.current.value = "";
    }
  };

  const handleGroupCoverChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    groupId: number,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fd = new FormData();
    fd.append("cover_photo", e.target.files[0]);
    try {
      await agencyUnitManagementApi.updateUnitGroup(propertyId, groupId, fd);
      const groupsData =
        await agencyUnitManagementApi.getUnitGroups(propertyId);
      setUnitGroups(groupsData);
      alert("✅ Unit Group cover updated!");
    } catch (error) {
      alert("Failed to update group cover.");
    } finally {
      setEditingGroupCoverId(null);
      if (groupCoverInputRef.current) groupCoverInputRef.current.value = "";
    }
  };

  const handleGroupMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    groupId: number,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadingGroupMediaId(groupId);
    try {
      for (const file of files) {
        const mediaType = file.type.startsWith("video") ? "video" : "image";
        await agencyUnitManagementApi.uploadMedia(
          propertyId,
          file,
          mediaType as "image" | "video",
          { unit_group_id: groupId },
        );
      }
      const mediaData =
        await agencyUnitManagementApi.getPropertyMedia(propertyId);
      setAllMedia(mediaData);
    } catch (error) {
      alert("Failed to upload group media.");
    } finally {
      setUploadingGroupMediaId(null);
      if (groupMediaInputRef.current) groupMediaInputRef.current.value = "";
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm("Delete this media?")) return;
    try {
      await agencyUnitManagementApi.deleteMedia(propertyId, mediaId);
      setAllMedia(allMedia.filter((m) => m.id !== mediaId));
    } catch (error) {
      alert("Failed to delete.");
    }
  };
  const handleUpdateCaption = async (mediaId: number, newCaption: string) => {
    try {
      await agencyPropertiesApi.updateMediaCaption(
        propertyId,
        mediaId,
        newCaption,
      );
      setAllMedia((prev) =>
        prev.map((m) => (m.id === mediaId ? { ...m, caption: newCaption } : m)),
      );
    } catch (error) {
      alert("Failed to update caption.");
    }
  };
  const handleSetAsCover = async (mediaUrl: string) => {
    if (!confirm("Set this media as the property cover photo?")) return;
    try {
      const newUrl = await agencyPropertiesApi.setCoverFromMedia(
        propertyId,
        mediaUrl,
      );
      onPropertyCoverChange(newUrl);
      alert("✅ Set as cover photo!");
    } catch (error) {
      alert("Failed to set cover photo.");
    }
  };

  const propertyGallery = allMedia.filter(
    (m) => !m.unit_group_id && !m.unit_id,
  );
  if (loading)
    return (
      <div className="text-center py-12 text-slate-400">
        Loading media hub...
      </div>
    );

  return (
    <div className="space-y-10">
      <input
        type="file"
        ref={propertyCoverInputRef}
        className="hidden"
        accept="image/*"
        onChange={handlePropertyCoverChange}
      />
      <input
        type="file"
        ref={propertyMediaInputRef}
        className="hidden"
        accept="image/*,video/*"
        multiple
        onChange={handlePropertyMediaUpload}
      />
      <input
        type="file"
        ref={groupCoverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) =>
          editingGroupCoverId && handleGroupCoverChange(e, editingGroupCoverId)
        }
      />
      <input
        type="file"
        ref={groupMediaInputRef}
        className="hidden"
        accept="image/*,video/*"
        multiple
        onChange={(e) =>
          uploadingGroupMediaId &&
          handleGroupMediaUpload(e, uploadingGroupMediaId)
        }
      />

      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-xl font-bold text-primary-dark mb-6">
          Property Level Media
        </h2>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase">
              Main Cover Photo
            </h3>
            {canEdit && (
              <button
                onClick={() => propertyCoverInputRef.current?.click()}
                className="text-xs text-primary font-bold hover:underline"
              >
                Change Cover
              </button>
            )}
          </div>
          <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {currentPropertyCover ? (
              <img
                src={currentPropertyCover}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-slate-400">No cover photo set</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase">
              Property Gallery ({propertyGallery.length})
            </h3>
            {canEdit && (
              <button
                onClick={() => propertyMediaInputRef.current?.click()}
                disabled={uploadingPropertyMedia}
                className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"
              >
                {uploadingPropertyMedia
                  ? "Uploading..."
                  : "+ Add Photos/Videos"}
              </button>
            )}
          </div>
          {propertyGallery.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
              No property gallery images yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {propertyGallery.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  canEdit={canEdit}
                  onDelete={() => handleDeleteMedia(item.id)}
                  onSetAsCover={() => handleSetAsCover(item.url)}
                  onUpdateCaption={(newCaption) =>
                    handleUpdateCaption(item.id, newCaption)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary-dark mb-6">
          Unit Group Media & Covers
        </h2>
        <p className="text-xs text-slate-500 mb-6 -mt-4">
          Media uploaded here is inherited by all units belonging to these
          groups.
        </p>
        {unitGroups.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">
            No unit groups defined yet.
          </div>
        ) : (
          <div className="space-y-8">
            {unitGroups.map((group) => {
              const groupGallery = allMedia.filter(
                (m) => m.unit_group_id === group.id,
              );
              return (
                <div
                  key={group.id}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {group.name}
                    </h3>
                    <span className="text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200">
                      {groupGallery.length} Media Files
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Group Cover Photo
                      </p>
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingGroupCoverId(group.id);
                            groupCoverInputRef.current?.click();
                          }}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <div className="w-full h-32 bg-white rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {group.cover_photo ? (
                        <img
                          src={group.cover_photo}
                          alt={group.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <p className="text-slate-400 text-xs">No group cover</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        Group Gallery
                      </p>
                      {canEdit && (
                        <button
                          onClick={() => {
                            setUploadingGroupMediaId(group.id);
                            groupMediaInputRef.current?.click();
                          }}
                          disabled={uploadingGroupMediaId === group.id}
                          className="text-[10px] text-green-600 font-bold hover:underline"
                        >
                          {uploadingGroupMediaId === group.id
                            ? "Uploading..."
                            : "+ Add Media"}
                        </button>
                      )}
                    </div>
                    {groupGallery.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No media uploaded for this group yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
                        {groupGallery.map((item) => (
                          <MediaCard
                            key={item.id}
                            item={item}
                            canEdit={canEdit}
                            onDelete={() => handleDeleteMedia(item.id)}
                            onUpdateCaption={(newCaption) =>
                              handleUpdateCaption(item.id, newCaption)
                            }
                            size="small"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MEDIA CARD COMPONENT
// ==========================================
function MediaCard({
  item,
  canEdit,
  onDelete,
  onSetAsCover,
  onUpdateCaption,
  size = "normal",
}: {
  item: UnitMedia;
  canEdit: boolean;
  onDelete: () => void;
  onSetAsCover?: () => void;
  onUpdateCaption: (newCaption: string) => void;
  size?: "normal" | "small";
}) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(item.caption || "");
  const handleSaveCaption = () => {
    onUpdateCaption(captionValue);
    setIsEditingCaption(false);
  };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = `media-${item.id}${item.media_type === "video" ? ".mp4" : ".jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden relative group border border-slate-200 flex flex-col aspect-square">
      <div className="flex-1 relative bg-slate-100 min-h-[80px]">
        {item.media_type === "video" ? (
          <video src={item.url} className="w-full h-full object-cover" />
        ) : (
          <img
            src={item.url}
            alt={captionValue}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
          {canEdit && (
            <>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {onSetAsCover && (
                  <button
                    onClick={onSetAsCover}
                    className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary/90"
                  >
                    Set Cover
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsEditingCaption(true)}
                  className="px-2 py-1 bg-white text-slate-800 text-[10px] font-bold rounded hover:bg-slate-200"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </>
          )}
          {!canEdit && (
            <button
              onClick={handleDownload}
              className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700"
            >
              Download
            </button>
          )}
        </div>
      </div>
      <div className="p-1.5 border-t border-slate-200 bg-slate-50">
        {isEditingCaption ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              className="flex-1 text-[10px] px-1 py-0.5 border border-slate-300 rounded focus:outline-none focus:border-primary bg-white"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSaveCaption()}
            />
            <button
              onClick={handleSaveCaption}
              className="text-[10px] text-green-600 font-bold px-1"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditingCaption(false);
                setCaptionValue(item.caption || "");
              }}
              className="text-[10px] text-slate-400 font-bold px-1"
            >
              ✕
            </button>
          </div>
        ) : (
          <p
            className="text-[10px] text-slate-600 truncate"
            title={captionValue}
          >
            {captionValue || "No caption"}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE FORM COMPONENTS
// ==========================================
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
  if (type === "textarea")
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
  if (type === "select")
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
                ? parseFloat(e.target.value)
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
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${disabled ? "bg-slate-50 border-slate-200 cursor-not-allowed" : "bg-white border-slate-200 hover:border-primary/50"}`}
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
