"use client";

import React, { useState, useEffect } from "react";
import { UNIT_TYPES, BILLING_CYCLES } from "@/config/propertyEnums";
import {
  calculateUnitsPerFloor,
  UnitGroupDraft,
} from "@/store/propertyWizard.store";

interface UnitGroupFormProps {
  onSave: (group: UnitGroupDraft) => void;
  onCancel: () => void;
  initialData?: UnitGroupDraft | null; // ✅ ADDED: For editing
  maxFloors: number; // ✅ ADDED: Property limit
  availableCapacity: number; // ✅ ADDED: Remaining capacity
}

export default function UnitGroupForm({
  onSave,
  onCancel,
  initialData,
  maxFloors,
  availableCapacity,
}: UnitGroupFormProps) {
  // ✅ Initialize form with existing data if editing
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    unit_type: initialData?.unit_type || "one_bedroom",
    floor_start: initialData?.floor_range
      ? initialData.floor_range.split("-")[0]
      : "1",
    floor_end: initialData?.floor_range
      ? initialData.floor_range.split("-")[1]
      : "1",
    billing_cycle: initialData?.billing_cycle || "monthly",
    billing_date: initialData?.billing_date?.toString() || "5",
    base_rent_amount: initialData?.base_rent_amount || "",
    service_charge_amount: initialData?.service_charge_amount || "",
    deposit_amount: initialData?.deposit_amount || "",
    capacity: initialData?.capacity?.toString() || "1",
  });

  const [unitsPerFloor, setUnitsPerFloor] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const start = Number(formData.floor_start) || 1;
    const end = Number(formData.floor_end) || 1;
    const capacity = Number(formData.capacity) || 1;

    if (end >= start && capacity > 0) {
      setUnitsPerFloor(calculateUnitsPerFloor(capacity, start, end));
    } else {
      setUnitsPerFloor(0);
    }
  }, [formData.floor_start, formData.floor_end, formData.capacity]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const start = Number(formData.floor_start);
    const end = Number(formData.floor_end);
    const cap = Number(formData.capacity);

    // ✅ STRICT VALIDATION 1: Floor Limit
    if (end > maxFloors) {
      setFormError(
        `Ending floor (${end}) exceeds the property's total floors (${maxFloors}).`,
      );
      return;
    }

    // ✅ STRICT VALIDATION 2: Capacity Limit
    if (cap > availableCapacity) {
      setFormError(
        `Capacity (${cap}) exceeds the available property capacity (${availableCapacity}).`,
      );
      return;
    }

    onSave({
      name: formData.name,
      unit_type: formData.unit_type as UnitGroupDraft["unit_type"],
      floor_range: `${formData.floor_start}-${formData.floor_end}`,
      billing_cycle: formData.billing_cycle as UnitGroupDraft["billing_cycle"],
      billing_date: Number(formData.billing_date),
      base_rent_amount: formData.base_rent_amount,
      service_charge_amount: formData.service_charge_amount,
      deposit_amount: formData.deposit_amount,
      capacity: cap,
      units_per_floor: unitsPerFloor,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-4"
    >
      <h3 className="text-lg font-bold text-primary-dark mb-4">
        {initialData ? "Edit Unit Group" : "Add New Unit Group"}
      </h3>

      {formError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200 font-medium">
          ⚠️ {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Group Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Group Name / Prefix *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Block A, Wing 1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Unit Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Unit Type *
          </label>
          <select
            name="unit_type"
            value={formData.unit_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            {UNIT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total Capacity (Units) *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min={1}
            max={availableCapacity} // ✅ HTML5 Validation
            placeholder={`Max: ${availableCapacity}`}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Floor Range */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Starting Floor *
            </label>
            <input
              type="number"
              name="floor_start"
              value={formData.floor_start}
              onChange={handleChange}
              required
              min={1}
              max={maxFloors}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Ending Floor *
            </label>
            <input
              type="number"
              name="floor_end"
              value={formData.floor_end}
              onChange={handleChange}
              required
              min={Number(formData.floor_start) || 1}
              max={maxFloors} // ✅ HTML5 Validation
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Smart Logic Display */}
        <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
          <span className="text-2xl">🧮</span>
          <div>
            <p className="text-sm font-semibold text-primary-dark">
              Smart Distribution
            </p>
            <p className="text-xs text-slate-600">
              This will generate{" "}
              <strong className="text-secondary">{unitsPerFloor}</strong>{" "}
              unit(s) per floor across{" "}
              {Number(formData.floor_end) - Number(formData.floor_start) + 1}{" "}
              floor(s).
            </p>
          </div>
        </div>

        {/* Billing Cycle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Billing Cycle *
          </label>
          <select
            name="billing_cycle"
            value={formData.billing_cycle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle.value} value={cycle.value}>
                {cycle.label}
              </option>
            ))}
          </select>
        </div>

        {/* Billing Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Billing Date (Day) *
          </label>
          <input
            type="number"
            name="billing_date"
            value={formData.billing_date}
            onChange={handleChange}
            required
            min={1}
            max={31}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Pricing */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Base Rent (KES) *
          </label>
          <input
            type="number"
            name="base_rent_amount"
            value={formData.base_rent_amount}
            onChange={handleChange}
            required
            min={0}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deposit (KES) *
          </label>
          <input
            type="number"
            name="deposit_amount"
            value={formData.deposit_amount}
            onChange={handleChange}
            required
            min={0}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Service Charge (KES)
          </label>
          <input
            type="number"
            name="service_charge_amount"
            value={formData.service_charge_amount}
            onChange={handleChange}
            min={0}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary px-6 py-2">
          {initialData ? "Save Changes" : "Add Unit Group"}
        </button>
      </div>
    </form>
  );
}
