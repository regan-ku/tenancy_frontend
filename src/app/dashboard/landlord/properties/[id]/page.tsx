"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import PropertyTenantsView from "@/components/landlord/PropertyTenantsView"; // ✅ NEW IMPORT

// Mock Data for Units
const mockUnits = [
  {
    id: 1,
    unit_code: "A-101",
    unit_type: "one_bedroom",
    floor: 1,
    rent: 15000,
    status: "occupied",
  },
  {
    id: 2,
    unit_code: "A-102",
    unit_type: "one_bedroom",
    floor: 1,
    rent: 15000,
    status: "available",
  },
  {
    id: 3,
    unit_code: "B-201",
    unit_type: "bedsitter",
    floor: 2,
    rent: 8000,
    status: "available",
  },
];

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<
    "overview" | "units" | "tenants" | "media"
  >("overview");

  // Property State
  const [propertyName, setPropertyName] = useState("Myles Apartment");
  const [propertyDesc, setPropertyDesc] = useState(
    "A modern residential complex located in Kilimani, featuring ample parking and 24/7 security.",
  );
  const [isEditing, setIsEditing] = useState(false);

  // Unit State
  const [units, setUnits] = useState(mockUnits);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const handleSaveProperty = () => {
    // API call to update property would go here
    setIsEditing(false);
    alert("✅ Property details updated successfully!");
  };

  const handleRemoveUnit = (unitId: number) => {
    if (
      confirm(
        "Are you sure you want to remove this unit? This cannot be undone.",
      )
    ) {
      setUnits(units.filter((u) => u.id !== unitId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            {propertyName}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Property ID: {id} • Kilimani, Nairobi
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
            View on Marketplace
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-sm">
            Publish Updates
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "overview", label: "Overview" },
            { key: "units", label: "Unit Management" },
            { key: "tenants", label: "Tenants & Financials" }, // ✅ NEW TAB
            { key: "media", label: "Media & Documents" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* OVERVIEW TAB (Edit Property) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                Property Information
              </h2>
              <button
                onClick={() =>
                  isEditing ? handleSaveProperty() : setIsEditing(true)
                }
                className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isEditing ? "bg-green-600 text-white hover:bg-green-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {isEditing ? "Save Changes" : "Edit Details"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Property Name
                </label>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Property Category
                </label>
                <input
                  type="text"
                  value="Residential (Apartments)"
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={propertyDesc}
                  onChange={(e) => setPropertyDesc(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* UNITS TAB (Add/Remove Units) */}
        {activeTab === "units" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Unit Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Total Capacity: {units.length} Units
                </p>
              </div>
              <button
                onClick={() => setShowAddUnit(!showAddUnit)}
                className="flex items-center gap-2 bg-secondary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-secondary/90 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Unit
              </button>
            </div>

            {/* Add Unit Form (Toggleable) */}
            {showAddUnit && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-bold text-blue-800">Create New Unit</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Unit Code (e.g., C-301)"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                    <option>Bedsitter</option>
                    <option>One Bedroom</option>
                    <option>Two Bedroom</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Floor Number"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Rent Amount (KES)"
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg">
                    Save Unit
                  </button>
                  <button
                    onClick={() => setShowAddUnit(false)}
                    className="text-slate-500 text-sm font-medium px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Units Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-3">Unit Code</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Floor</th>
                    <th className="px-6 py-3">Rent</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {units.map((unit) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {unit.unit_code}
                      </td>
                      <td className="px-6 py-4 text-slate-600 capitalize">
                        {unit.unit_type.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{unit.floor}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        KES {unit.rent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${unit.status === "occupied" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {unit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRemoveUnit(unit.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ✅ NEW: TENANTS & FINANCIALS TAB */}
        {activeTab === "tenants" && <PropertyTenantsView />}

        {/* MEDIA TAB Placeholder */}
        {activeTab === "media" && (
          <div className="text-center py-12 text-slate-400">
            <p>Media & Document uploads will be managed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
