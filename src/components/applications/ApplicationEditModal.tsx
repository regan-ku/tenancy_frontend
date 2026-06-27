"use client";

import React, { useState, useEffect } from "react";
import { AgencyApplication } from "@/api/agencyOperations.api";
import { agencyUnitManagementApi, Unit } from "@/api/agencyUnitManagement.api";
import { agencyPropertiesApi } from "@/api/agencyProperties.api";
import apiClient from "@/api/axios";

interface ApplicationEditModalProps {
  application: AgencyApplication;
  onClose: () => void;
  onComplete: () => void;
}

interface Property {
  id: number;
  name: string;
  total_units: number;
}

export default function ApplicationEditModal({
  application,
  onClose,
  onComplete,
}: ApplicationEditModalProps) {
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

  // Load current application data into form
  useEffect(() => {
    loadProperties();

    // Pre-fill form with existing data
    if (application.application_type === "transfer") {
      setReason(application.transfer_reason || "");
      setMoveInDate(application.desired_move_in_date || "");
      // We'll need to fetch the current target unit ID
    } else if (application.application_type === "termination") {
      setReason(application.termination_notes || "");
      setMoveInDate(application.proposed_move_out_date || "");
    } else if (application.application_type === "extension") {
      setReason(application.extension_reason || "");
      setMoveInDate(application.new_end_date || "");
    }
  }, [application]);

  useEffect(() => {
    if (selectedPropertyId && application.application_type === "transfer") {
      loadUnitsForProperty(selectedPropertyId);
    } else {
      setAvailableUnits([]);
    }
  }, [selectedPropertyId, application.application_type]);

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
        .filter((u) => u.status === "available")
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
    setIsSubmitting(true);
    setError("");

    try {
      const updateData: any = {};

      if (application.application_type === "transfer") {
        if (!selectedUnit) {
          setError("Please select a target unit");
          setIsSubmitting(false);
          return;
        }
        if (!reason.trim()) {
          setError("Please provide a reason");
          setIsSubmitting(false);
          return;
        }

        updateData.to_unit_id = selectedUnit;
        updateData.reason = reason;
        if (moveInDate) updateData.desired_move_in_date = moveInDate;
        if (notes) updateData.notes = notes;
      } else if (application.application_type === "termination") {
        if (!moveInDate) {
          setError("Please provide a move-out date");
          setIsSubmitting(false);
          return;
        }

        updateData.intended_vacate_date = moveInDate;
        if (reason) updateData.reason = reason;
      } else if (application.application_type === "extension") {
        if (!moveInDate) {
          setError("Please provide a new end date");
          setIsSubmitting(false);
          return;
        }

        updateData.new_end_date = moveInDate;
        if (reason) updateData.reason = reason;
      }

      // PATCH request to update application
      await apiClient.patch(
        `/api/v1/applications/${application.id}/`,
        updateData,
      );

      alert("✅ Application updated successfully");
      onComplete();
    } catch (err: any) {
      console.error("Failed to update application:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to update application",
      );
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
              Edit{" "}
              {application.application_type.charAt(0).toUpperCase() +
                application.application_type.slice(1)}{" "}
              Application
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Application #{application.id} • Status: {application.status}
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
          {/* Edit Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-bold text-amber-800">
              Editing Application
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {application.status === "approved"
                ? "This application has been approved. Changes will be reflected immediately."
                : "This application is pending review. Changes will be reviewed by the manager."}
            </p>
          </div>

          {/* Transfer-specific fields */}
          {application.application_type === "transfer" && (
            <>
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
                    Select Available Unit{" "}
                    <span className="text-red-500">*</span>
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
                                    KES{" "}
                                    {Number(unit.rent_amount).toLocaleString()}
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
            </>
          )}

          {/* Move-in/Move-out Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              {application.application_type === "termination"
                ? "Move-Out Date"
                : application.application_type === "extension"
                  ? "New End Date"
                  : "Preferred Move-in Date"}{" "}
              <span className="text-red-500">*</span>
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
              {application.application_type === "transfer"
                ? "Reason for Transfer"
                : application.application_type === "termination"
                  ? "Reason for Termination"
                  : "Reason for Extension"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Provide a reason..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Notes (Transfer only) */}
          {application.application_type === "transfer" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          )}

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
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              "Update Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
