"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // ✅ ADDED
import {
  agencyUnitManagementApi,
  UnitGroup,
  Unit,
} from "@/api/agencyUnitManagement.api";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import AddTenantModal from "./AddTenantModal";
import { useApplicationWizardStore } from "@/store/applicationWizard.store"; // ✅ ADDED

interface UnitManagementTabProps {
  propertyId: number;
  canEdit?: boolean;
  maxFloors?: number; // ✅ Max floors allowed for validation
}

// ✅ Modern Status Badge Colors
const statusColors: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  occupied: "bg-slate-100 text-slate-600 border border-slate-200",
  maintenance: "bg-amber-50 text-amber-700 border border-amber-200",
  reserved: "bg-purple-50 text-purple-700 border border-purple-200",
};

export default function UnitManagementTab({
  propertyId,
  canEdit = true,
  maxFloors = 0,
}: UnitManagementTabProps) {
  const router = useRouter(); // ✅ ADDED

  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingGroup, setEditingGroup] = useState<UnitGroup | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [addingUnitToGroup, setAddingUnitToGroup] = useState<UnitGroup | null>(
    null,
  );
  const [addingTenantToUnit, setAddingTenantToUnit] = useState<Unit | null>(
    null,
  );

  // Unit Cover Photo Upload States
  const [uploadingUnitCover, setUploadingUnitCover] = useState<number | null>(
    null,
  );
  const unitCoverInputRef = useRef<HTMLInputElement>(null);
  const [activeUnitIdForCover, setActiveUnitIdForCover] = useState<
    number | null
  >(null);

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
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (
    groupId: number,
    updates: FormData | Partial<UnitGroup>,
  ) => {
    try {
      await agencyUnitManagementApi.updateUnitGroup(
        propertyId,
        groupId,
        updates,
      );
      await loadData();
      setEditingGroup(null);
      alert("✅ Unit Group updated!");
    } catch (error) {
      alert("Failed to update group.");
    }
  };

  const handleUpdateUnit = async (unitId: number, updates: Partial<Unit>) => {
    try {
      await agencyUnitManagementApi.updateUnit(propertyId, unitId, updates);
      await loadData();
      setEditingUnit(null);
      alert("✅ Unit updated!");
    } catch (error) {
      alert("Failed to update unit.");
    }
  };

  const handleAddUnit = async (groupId: number, floorNumber: number) => {
    try {
      await agencyUnitManagementApi.addUnitToGroup(
        propertyId,
        groupId,
        floorNumber,
      );
      await loadData();
      setAddingUnitToGroup(null);
      alert("✅ Unit added successfully!");
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Failed to add unit.";
      alert(errorMsg);
    }
  };

  const handleDeleteUnit = async (unitId: number, unitCode: string) => {
    if (
      !confirm(
        `Are you sure you want to delete unit ${unitCode}? This action cannot be undone.`,
      )
    )
      return;

    try {
      await agencyUnitManagementApi.deleteUnit(propertyId, unitId);
      await loadData();
      alert("✅ Unit deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete unit:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        "Failed to delete unit. It might be occupied.";
      alert(errorMsg);
    }
  };

  const handleUnitCoverChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    unitId: number,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingUnitCover(unitId);
    const formData = new FormData();
    formData.append("cover_photo", file);
    try {
      await apiClient.patch(
        endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      await loadData();
      alert("✅ Unit cover photo updated!");
    } catch (error) {
      alert("Failed to update unit cover photo.");
    } finally {
      setUploadingUnitCover(null);
      setActiveUnitIdForCover(null);
      if (unitCoverInputRef.current) unitCoverInputRef.current.value = "";
    }
  };

  const safeUnits = Array.isArray(units) ? units : [];

  // ✅ BULLETPROOF GROUPING: Group by Unit Group ID instead of String Name
  const unitsByGroupId = safeUnits.reduce(
    (acc, unit) => {
      const groupId = unit.unit_group_id; // This is the FK ID from the backend

      if (!groupId) {
        if (!acc["ungrouped"]) acc["ungrouped"] = [];
        acc["ungrouped"].push(unit);
      } else {
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push(unit);
      }
      return acc;
    },
    {} as Record<string | number, Unit[]>,
  );

  // ✅ Map actual Unit Groups to their units using the ID
  const groupsToRender: {
    group: UnitGroup | null;
    groupName: string;
    units: Unit[];
  }[] = unitGroups.map((group) => ({
    group,
    groupName: group.name,
    units: unitsByGroupId[group.id] || [],
  }));

  // Add ungrouped units at the end if they exist
  if (unitsByGroupId["ungrouped"] && unitsByGroupId["ungrouped"].length > 0) {
    groupsToRender.push({
      group: null,
      groupName: "Ungrouped",
      units: unitsByGroupId["ungrouped"],
    });
  }

  const hasAnyData = unitGroups.length > 0 || safeUnits.length > 0;

  if (loading)
    return (
      <div className="p-8 text-center text-slate-400">Loading units...</div>
    );

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={unitCoverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) =>
          activeUnitIdForCover && handleUnitCoverChange(e, activeUnitIdForCover)
        }
      />

      <div className="space-y-6">
        {!hasAnyData ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg font-medium">
              No unit groups or units defined yet.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Go to the Overview tab to add your first Unit Group.
            </p>
          </div>
        ) : (
          // ✅ FIX: Iterate over groupsToRender instead of just the units
          groupsToRender.map(({ group, groupName, units: groupUnits }) => {
            return (
              <div
                key={groupName}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Group Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {groupName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {group
                        ? `${group.unit_type.replace("_", " ")} • ${group.units_count || group.capacity || groupUnits.length} Units`
                        : "Unassigned Units"}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      {group && (
                        <button
                          onClick={() => setEditingGroup(group)}
                          className="px-3 py-1.5 text-xs font-bold border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition-colors"
                        >
                          Edit Group
                        </button>
                      )}
                      {group && (
                        <button
                          onClick={() => setAddingUnitToGroup(group)}
                          className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          + Add Unit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Units Grid */}
                <div className="p-5">
                  {groupUnits.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
                      No units in this group yet. Click{" "}
                      <strong>"+ Add Unit"</strong> to create one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupUnits.map((unit) => {
                        const displayCover =
                          unit.cover_photo || group?.cover_photo || "";
                        const isOccupied = unit.status === "occupied";

                        return (
                          <div
                            key={unit.id}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Image Area */}
                            <div className="h-32 bg-slate-100 relative group">
                              {displayCover ? (
                                <img
                                  src={displayCover}
                                  alt={unit.unit_code}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                                  No Image
                                </div>
                              )}

                              <span
                                className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${statusColors[unit.status] || statusColors.available}`}
                              >
                                {unit.status}
                              </span>

                              {canEdit && !isOccupied && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    onClick={() => {
                                      if (unitCoverInputRef.current) {
                                        setActiveUnitIdForCover(unit.id);
                                        unitCoverInputRef.current.click();
                                      }
                                    }}
                                    disabled={uploadingUnitCover === unit.id}
                                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow hover:bg-slate-100 flex items-center gap-1"
                                  >
                                    {uploadingUnitCover === unit.id ? (
                                      <div className="w-3 h-3 border-2 border-slate-800/30 border-t-slate-800 rounded-full animate-spin"></div>
                                    ) : (
                                      <>📷 Change Cover</>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Content Area */}
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 text-base">
                                  {unit.unit_code}
                                </h4>
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Floor {unit.floor_number}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 mb-3 capitalize">
                                {unit.unit_type.replace("_", " ")}
                              </p>

                              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Rent:</span>
                                  <span className="font-bold text-slate-800">
                                    KES{" "}
                                    {Number(unit.rent_amount).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">
                                    Deposit:
                                  </span>
                                  <span className="font-medium">
                                    KES{" "}
                                    {Number(
                                      unit.deposit_amount,
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              {canEdit && (
                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                  {isOccupied ? (
                                    <button
                                      disabled
                                      className="w-full py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                      🔒 Occupied - Editing Locked
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => setEditingUnit(unit)}
                                        className="w-full py-2 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition-colors"
                                      >
                                        Edit Details
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteUnit(
                                            unit.id,
                                            unit.unit_code,
                                          )
                                        }
                                        className="w-full py-2 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
                                      >
                                        🗑️ Delete Unit
                                      </button>

                                      {unit.status === "available" && (
                                        <button
                                          onClick={() =>
                                            setAddingTenantToUnit(unit)
                                          }
                                          className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 shadow-sm"
                                        >
                                          + Add Tenant
                                        </button>
                                      )}
                                    </>
                                  )}
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
          })
        )}
      </div>

      {/* MODALS */}
      {editingGroup && (
        <EditUnitGroupModal
          group={editingGroup}
          propertyId={propertyId}
          onClose={() => setEditingGroup(null)}
          onSave={handleUpdateGroup}
        />
      )}
      {editingUnit && (
        <EditUnitModal
          unit={editingUnit}
          propertyId={propertyId}
          onClose={() => setEditingUnit(null)}
          onSave={handleUpdateUnit}
        />
      )}
      {addingUnitToGroup && (
        <AddUnitModal
          group={addingUnitToGroup}
          maxFloors={maxFloors}
          onClose={() => setAddingUnitToGroup(null)}
          onSave={handleAddUnit}
        />
      )}

      {/* ✅ RENDER THE ADD TENANT MODAL WITH WIZARD NAVIGATION */}
      {addingTenantToUnit && (
        <AddTenantModal
          unit={addingTenantToUnit}
          onClose={() => setAddingTenantToUnit(null)}
          onSuccess={(tenantData) => {
            // 1. Close the modal
            setAddingTenantToUnit(null);

            // 2. Populate the Wizard Store with the new tenant's details
            const wizardStore = useApplicationWizardStore.getState();
            wizardStore.updateFormData({
              applicant: tenantData.id,
              full_name: tenantData.full_name,
              email: tenantData.email,
              phone_number: tenantData.phone_number,
              // Pre-fill unit details so the wizard doesn't have to guess
              target_unit_id: addingTenantToUnit.id,
              propertyId: propertyId,
              unitGroupId: addingTenantToUnit.unit_group_id,
            });

            // 3. Navigate to the Wizard with Manager Mode flags
            const params = new URLSearchParams({
              type: "rental",
              mode: "manager",
              tenant_id: tenantData.id.toString(),
              target_unit_id: addingTenantToUnit.id.toString(),
              property_id: propertyId.toString(),
              unit_group_id: addingTenantToUnit.unit_group_id?.toString() || "",
            });

            router.push(
              `/marketplace/applications/wizard?${params.toString()}`,
            );
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// ADD UNIT MODAL
// ==========================================
function AddUnitModal({
  group,
  maxFloors,
  onClose,
  onSave,
}: {
  group: UnitGroup;
  maxFloors: number;
  onClose: () => void;
  onSave: (groupId: number, floorNumber: number) => Promise<void>;
}) {
  const [floorNumber, setFloorNumber] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(group.id, floorNumber);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            Add Unit to {group.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            ℹ️ This unit will automatically inherit all pricing, billing, and
            rules from the <strong>{group.name}</strong> group.
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Floor Number
            </label>
            <input
              type="number"
              min="0"
              max={maxFloors}
              value={floorNumber}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > maxFloors) val = maxFloors;
                if (val < 0) val = 0;
                setFloorNumber(val);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              autoFocus
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Allowed floors: 0 (Ground) to {maxFloors}.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isSaving ? "Creating..." : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// EDIT UNIT GROUP MODAL
// ==========================================
function EditUnitGroupModal({
  group,
  propertyId,
  onClose,
  onSave,
}: {
  group: UnitGroup;
  propertyId: number;
  onClose: () => void;
  onSave: (id: number, data: FormData) => Promise<void>;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [baseRent, setBaseRent] = useState(group.base_rent_amount);
  const [serviceCharge, setServiceCharge] = useState(group.service_charge);
  const [deposit, setDeposit] = useState(group.deposit_amount);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(group.cover_photo || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
      setCoverPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("base_rent_amount", baseRent.toString());
      fd.append("service_charge", serviceCharge.toString());
      fd.append("deposit_amount", deposit.toString());
      if (coverFile) fd.append("cover_photo", coverFile);
      await onSave(group.id, fd);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">
            Edit Unit Group: {group.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Group Cover Photo
            </label>
            <div
              className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden relative cursor-pointer border border-slate-200"
              onClick={() => fileRef.current?.click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  Click to upload cover photo
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Base Rent
              </label>
              <input
                type="number"
                value={baseRent}
                onChange={(e) => setBaseRent(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Service Charge
              </label>
              <input
                type="number"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Deposit
              </label>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// EDIT UNIT MODAL
// ==========================================
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
    floor_number: unit.floor_number,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(unit.id, formData);
    } catch (error) {
      console.error("Unit save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
            ℹ️ <strong>Note:</strong> &quot;Allows Pets&quot; and &quot;Parking
            Spaces&quot; are inherited from the main Property settings.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Allows Pets
              </p>
              <p className="text-sm font-medium text-slate-600">
                {unit.allows_pets ? "✅ Yes" : "❌ No"}{" "}
                <span className="text-[10px] text-slate-400 ml-1">
                  (Inherited)
                </span>
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Parking Spaces
              </p>
              <p className="text-sm font-medium text-slate-600">
                {unit.parking_spaces}{" "}
                <span className="text-[10px] text-slate-400 ml-1">
                  (Inherited)
                </span>
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Floor Number
            </label>
            <input
              type="number"
              min="0"
              value={formData.floor_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  floor_number: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Deposit
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
