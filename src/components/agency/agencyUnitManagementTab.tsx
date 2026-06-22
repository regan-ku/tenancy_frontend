"use client";

import React, { useState, useEffect } from "react";
import {
  agencyUnitManagementApi,
  UnitGroup,
  Unit,
  UnitMedia,
} from "@/api/agencyUnitManagement.api";
import UnitMediaGallery from "./unitMediaGallery";

interface UnitManagementTabProps {
  propertyId: number;
}

export default function UnitManagementTab({
  propertyId,
}: UnitManagementTabProps) {
  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, unitsData] = await Promise.all([
        agencyUnitManagementApi.getUnitGroups(propertyId),
        agencyUnitManagementApi.getUnits(propertyId),
      ]);
      setUnitGroups(groupsData);
      setUnits(unitsData);
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUnit = async (unitId: number, updates: Partial<Unit>) => {
    try {
      await agencyUnitManagementApi.updateUnit(propertyId, unitId, updates);
      await loadData();
      setEditingUnit(null);
      alert("✅ Unit updated successfully!");
    } catch (error) {
      alert("Failed to update unit.");
    }
  };

  const groupedUnits = units.reduce(
    (acc, unit) => {
      const groupName = unit.unit_group_name || "Ungrouped";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(unit);
      return acc;
    },
    {} as Record<string, Unit[]>,
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">Loading units...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unit Groups Overview */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Unit Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unitGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white p-4 rounded-xl border border-slate-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800">{group.name}</h4>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                  {group.units_count} units
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{group.description}</p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Type:{" "}
                  <span className="font-medium">
                    {group.unit_type.replace("_", " ")}
                  </span>
                </p>
                <p>
                  Floors:{" "}
                  <span className="font-medium">{group.floor_range}</span>
                </p>
                <p>
                  Rent:{" "}
                  <span className="font-medium">
                    KES {group.base_rent_amount.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Units by Group */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Units</h3>
        <div className="space-y-6">
          {Object.entries(groupedUnits).map(([groupName, groupUnits]) => (
            <div key={groupName} className="bg-slate-50 rounded-xl p-4">
              <h4 className="font-bold text-slate-700 mb-3">{groupName}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                  >
                    {/* Unit Header */}
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">
                          {unit.unit_code}
                        </p>
                        <p className="text-xs text-slate-500">
                          {unit.unit_type.replace("_", " ")}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                          unit.status === "occupied"
                            ? "bg-green-100 text-green-700"
                            : unit.status === "available"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {unit.status}
                      </span>
                    </div>

                    {/* Unit Details */}
                    <div className="p-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Floor:</span>
                        <span className="font-medium">{unit.floor_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rent:</span>
                        <span className="font-medium">
                          KES {unit.rent_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deposit:</span>
                        <span className="font-medium">
                          KES {unit.deposit_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service Charge:</span>
                        <span className="font-medium">
                          KES {unit.service_charge.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => setEditingUnit(unit)}
                        className="flex-1 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUnit(unit);
                          setShowMediaModal(true);
                        }}
                        className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200"
                      >
                        Media
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Unit Modal */}
      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          propertyId={propertyId}
          onClose={() => setEditingUnit(null)}
          onSave={handleUpdateUnit}
        />
      )}

      {/* Media Gallery Modal */}
      {showMediaModal && selectedUnit && (
        <UnitMediaGallery
          propertyId={propertyId}
          unit={selectedUnit}
          onClose={() => {
            setShowMediaModal(false);
            setSelectedUnit(null);
          }}
          onMediaChange={loadData}
        />
      )}
    </div>
  );
}

// Edit Unit Modal Component
function EditUnitModal({
  unit,
  propertyId,
  onClose,
  onSave,
}: {
  unit: Unit;
  propertyId: number;
  onClose: () => void;
  onSave: (unitId: number, updates: Partial<Unit>) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    rent_amount: unit.rent_amount,
    deposit_amount: unit.deposit_amount,
    service_charge: unit.service_charge,
    billing_cycle: unit.billing_cycle,
    billing_date: unit.billing_date,
    allows_pets: unit.allows_pets,
    parking_spaces: unit.parking_spaces,
    status: unit.status,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(unit.id, formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Edit Unit {unit.unit_code}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Rent Amount
              </label>
              <input
                type="number"
                value={formData.rent_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rent_amount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Deposit Amount
              </label>
              <input
                type="number"
                value={formData.deposit_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deposit_amount: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Service Charge
            </label>
            <input
              type="number"
              value={formData.service_charge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  service_charge: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Billing Cycle
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) =>
                  setFormData({ ...formData, billing_cycle: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Billing Date
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.billing_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billing_date: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allows_pets}
                onChange={(e) =>
                  setFormData({ ...formData, allows_pets: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium">Allows Pets</span>
            </label>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Parking Spaces
              </label>
              <input
                type="number"
                value={formData.parking_spaces}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parking_spaces: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
