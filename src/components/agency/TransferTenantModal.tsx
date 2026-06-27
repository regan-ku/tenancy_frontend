"use client";

import React, { useState, useEffect } from "react";
import { TenantFinancialInfo } from "@/api/agencyUnitManagement.api";
import { tenanciesApi } from "@/api/tenancies.api";
import { agencyUnitManagementApi, Unit } from "@/api/agencyUnitManagement.api";
import { agencyPropertiesApi } from "@/api/agencyProperties.api";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

interface TransferTenantModalProps {
  tenant: TenantFinancialInfo;
  propertyId: number;
  onClose: () => void;
  onComplete: () => void;
}

interface Property {
  id: number;
  name: string;
  total_units: number;
}

export default function TransferTenantModal({
  tenant,
  propertyId,
  onClose,
  onComplete,
}: TransferTenantModalProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      loadUnitsForProperty(selectedPropertyId);
    } else {
      setAvailableUnits([]);
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    setIsLoadingProperties(true);
    try {
      const props = await agencyPropertiesApi.getManagedProperties();
      setProperties(
        props.map((p) => ({
          id: p.id,
          name: p.name,
          total_units: p.total_units,
        })),
      );
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError("Failed to load properties");
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const loadUnitsForProperty = async (propId: number) => {
    setIsLoadingUnits(true);
    setSelectedUnit(null);
    try {
      const units = await agencyUnitManagementApi.getUnits(propId);
      const available = units
        .filter(
          (u) => u.status === "available" && u.unit_code !== tenant.unit_code,
        )
        .map((u) => ({ ...u }));
      setAvailableUnits(available);
    } catch (err) {
      console.error("Failed to load units:", err);
      setError("Failed to load units");
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUnit) {
      setError("Please select a target unit");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for transfer");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const tenancies = await tenanciesApi.getTenancies();

      const tenantTenancy = tenancies.find(
        (t: any) =>
          t.tenant === tenant.tenant_id &&
          t.unit_code === tenant.unit_code &&
          (t.status === "active" || t.status === "extended"),
      );

      if (!tenantTenancy) {
        throw new Error("Active tenancy not found");
      }

      const selectedUnitData = availableUnits.find(
        (u) => u.id === selectedUnit,
      );

      // ✅ FIXED: Send transfer fields at ROOT level + nested for backend compatibility
      await apiClient.post(endpoints.APPLICATIONS.LIST, {
        application_type: "transfer",
        applicant: tenant.tenant_id,
        property: tenantTenancy.property,
        unit: tenantTenancy.unit,

        // ✅ Transfer fields at ROOT level (required by backend)
        to_unit_id: selectedUnit,
        reason: reason,
        desired_move_in_date: moveInDate || null, // ✅ Also at root for backend
        notes: notes, // ✅ Also at root for backend

        // ✅ Keep nested structure for backward compatibility
        transfer_details: {
          from_unit: tenantTenancy.unit,
          from_property: tenantTenancy.property,
          to_unit: selectedUnit,
          to_property: selectedPropertyId,
          reason: reason,
          desired_move_in_date: moveInDate || null,
          notes: notes,
        },
      });

      alert(
        `✅ Transfer Application submitted for Unit ${selectedUnitData?.unit_code}! Please go to the Applications tab to Review & Decide.`,
      );
      onComplete();
    } catch (err: any) {
      console.error("Failed to submit transfer application:", err);

      // ✅ IMPROVED ERROR HANDLING
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join(" | ");
        setError(errors);
      } else {
        setError(err.message || "Failed to submit application");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Initiate Transfer
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {tenant.tenant_name} • Current: {tenant.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ✅ UPDATED: Unified Workflow Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-bold text-blue-800">Unified Workflow</p>
            <p className="text-xs text-blue-700 mt-1">
              This creates a <strong>Transfer Application</strong>. After
              submission, go to the <strong>Applications Tab</strong> to "Review
              & Decide".
            </p>
          </div>

          {/* Current Tenancy Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">
              Current Tenancy
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Unit</p>
                <p className="font-bold text-slate-800">{tenant.unit_code}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rent</p>
                <p className="font-bold text-slate-800">
                  KES {tenant.rent_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Deposit</p>
                <p className="font-bold text-slate-800">
                  KES {tenant.deposit_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Service Charge</p>
                <p className="font-bold text-slate-800">
                  KES {tenant.service_charge.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Select Target Property <span className="text-red-500">*</span>
            </label>

            {isLoadingProperties ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">
                  Loading properties...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedPropertyId === prop.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm">
                      {prop.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {prop.total_units} units
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unit Selection */}
          {selectedPropertyId && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Select Available Unit <span className="text-red-500">*</span>
              </label>

              {isLoadingUnits ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">
                    Loading available units...
                  </p>
                </div>
              ) : availableUnits.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-bold">
                    No available units
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This property has no available units at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUnits.map((unit) => (
                    <label
                      key={unit.id}
                      className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedUnit === unit.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="targetUnit"
                          checked={selectedUnit === unit.id}
                          onChange={() => setSelectedUnit(unit.id)}
                          className="w-4 h-4 text-primary"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-800">
                                {unit.unit_code}
                              </p>
                              <p className="text-xs text-slate-500">
                                {unit.unit_type.replace("_", " ")} • Floor{" "}
                                {unit.floor_number}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-800">
                                KES {Number(unit.rent_amount).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-500">
                                / {unit.billing_cycle}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Move-in Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Preferred Move-in Date
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Transfer <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g., Tenant requested larger unit, maintenance issues..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional information for the approval process..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !selectedUnit ||
              !reason.trim() ||
              !selectedPropertyId
            }
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
