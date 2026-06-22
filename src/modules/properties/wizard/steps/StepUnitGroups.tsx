"use client";

import React, { useState } from "react";
import {
  usePropertyWizardStore,
  UnitGroupDraft,
} from "@/store/propertyWizard.store";
import UnitGroupForm from "@/components/properties/wizard/UnitGroupForm";

export default function StepUnitGroups() {
  const { formData, addUnitGroup, updateUnitGroup, removeUnitGroup } =
    usePropertyWizardStore();

  const unitGroups = formData.unit_groups || [];
  const maxFloors = formData.number_of_floors || 1;
  const totalCapacity = formData.total_units_capacity || 0;

  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UnitGroupDraft | null>(null);

  // ✅ Calculate used capacity and what's left
  const usedCapacity = unitGroups.reduce((sum, g) => sum + g.capacity, 0);
  const availableCapacity =
    totalCapacity - usedCapacity + (editingGroup?.capacity || 0);

  // ✅ Check for global errors to show banners
  const hasCapacityError = usedCapacity > totalCapacity;
  const hasFloorError = unitGroups.some((g) => {
    const end = Number(g.floor_range.split("-")[1]);
    return end > maxFloors;
  });

  const handleSaveGroup = (group: UnitGroupDraft) => {
    if (editingGroup) {
      updateUnitGroup(editingGroup.id!, group);
    } else {
      addUnitGroup(group);
    }
    setIsAddingGroup(false);
    setEditingGroup(null);
  };

  const handleCancelGroup = () => {
    setIsAddingGroup(false);
    setEditingGroup(null);
  };

  const handleEditGroup = (group: UnitGroupDraft) => {
    setEditingGroup(group);
    setIsAddingGroup(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Unit Groups & Pricing
        </h2>
        <p className="text-slate-500">
          Define the different types of units in this property. Total Capacity:{" "}
          <strong>
            {usedCapacity} / {totalCapacity}
          </strong>{" "}
          units. Max Floors: <strong>{maxFloors}</strong>.
        </p>
      </div>

      {/* ✅ Global Error Banners */}
      {hasCapacityError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
          <p className="text-sm text-red-800 font-medium">
            Error: Total unit capacity ({usedCapacity}) exceeds the property's
            total capacity ({totalCapacity}). Please edit or remove unit groups.
          </p>
        </div>
      )}

      {hasFloorError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
          <p className="text-sm text-red-800 font-medium">
            Error: Some unit groups have floor ranges exceeding the property's{" "}
            {maxFloors} floors. Please edit them.
          </p>
        </div>
      )}

      {/* 1. List of existing unit groups */}
      {unitGroups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Defined Unit Groups ({unitGroups.length})
          </h3>
          {unitGroups.map((group: UnitGroupDraft) => {
            const endFloor = Number(group.floor_range.split("-")[1]);
            const isInvalidFloor = endFloor > maxFloors;

            return (
              <div
                key={group.id}
                className={`border rounded-xl p-4 flex justify-between items-start ${
                  isInvalidFloor
                    ? "bg-red-50 border-red-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-primary-dark text-base">
                    {group.name}
                  </p>
                  <p className="text-slate-600">
                    {group.unit_type.replace(/_/g, " ")} • Floors{" "}
                    {group.floor_range} • {group.units_per_floor} units/floor
                  </p>
                  <p className="text-slate-600">
                    Rent: KES {Number(group.base_rent_amount).toLocaleString()}{" "}
                    / {group.billing_cycle} • Capacity: {group.capacity}
                  </p>
                  {isInvalidFloor && (
                    <p className="text-xs text-red-600 font-semibold mt-1">
                      ⚠️ Floor {endFloor} exceeds property limit ({maxFloors})
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeUnitGroup(group.id!)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. The Add/Edit Group Form */}
      {isAddingGroup ? (
        <UnitGroupForm
          onSave={handleSaveGroup}
          onCancel={handleCancelGroup}
          initialData={editingGroup}
          maxFloors={maxFloors}
          availableCapacity={availableCapacity}
        />
      ) : (
        <button
          onClick={() => {
            setEditingGroup(null);
            setIsAddingGroup(true);
          }}
          disabled={hasCapacityError || hasFloorError}
          className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">➕</span> Add New Unit Group
        </button>
      )}

      {/* 3. Warning if no groups exist */}
      {unitGroups.length === 0 && !isAddingGroup && (
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
            Action Required: You must add at least one unit group to define the
            property's capacity and pricing.
          </p>
        </div>
      )}
    </div>
  );
}
