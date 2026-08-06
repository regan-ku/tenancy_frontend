"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { PersonalTenancy } from "@/api/tenancies.api"; // Ensure this import path matches your consolidated file

interface TransferRequestModalProps {
  tenancy: PersonalTenancy;
  onClose: () => void;
  onComplete?: () => void; // Added to refresh the parent page data
}

interface Property {
  id: number;
  title: string;
  name?: string;
}

interface Unit {
  id: number;
  unit_code: string;
  unit_type: string;
  floor_number: number;
  rent_amount: number;
  billing_cycle: string;
  status: string;
}

export default function TransferRequestModal({
  tenancy,
  onClose,
  onComplete,
}: TransferRequestModalProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  
  const [reason, setReason] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
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
      // Fetches properties managed by the tenant's landlord/agency
      const response = await apiClient.get(endpoints.PROPERTIES.LIST);
      const props = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setProperties(props.map((p: any) => ({ id: p.id, title: p.title || p.name || "Unknown Property" })));
    } catch (err) {
      setError("Failed to load properties. Please ensure your landlord/agency has properties available.");
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const loadUnitsForProperty = async (propId: number) => {
    setIsLoadingUnits(true);
    setSelectedUnitId(null);
    try {
      // Fetches units for the selected property
      const response = await apiClient.get(`${endpoints.PROPERTIES.LIST}${propId}/units/`);
      const units = Array.isArray(response.data) ? response.data : response.data?.results || [];
      
      // ✅ CRITICAL: Filter for AVAILABLE units and exclude the tenant's current unit
      const available = units.filter(
        (u: any) => u.status === "available" && u.unit_code !== tenancy.unit_code
      );
      setAvailableUnits(available);
    } catch (err) {
      setError("Failed to load units for this property.");
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUnitId) return setError("Please select a target unit.");
    if (!reason.trim()) return setError("Please provide a reason for the transfer.");

    setIsSubmitting(true);
    setError("");

    try {
      // Submit to the unified Applications endpoint
      await apiClient.post(endpoints.APPLICATIONS.LIST, {
        application_type: "transfer",
        to_unit_id: selectedUnitId,
        reason: reason,
        desired_move_in_date: moveInDate || null,
      });

      alert("✅ Transfer Request submitted! Your landlord/agency will review it in the Applications tab.");
      if (onComplete) onComplete();
      onClose();
    } catch (err: any) {
      const errors = err.response?.data 
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
        : err.message;
      setError(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50">
          <div>
            <h2 className="text-xl font-bold text-blue-800">Request Unit Transfer</h2>
            <p className="text-xs text-blue-600 mt-1">
              From: {tenancy.property_name} - Unit {tenancy.unit_code}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800">
            <strong>⚠️ Transfer Rules:</strong> Transfers are subject to unit availability and manager approval. 
            Your current lease terms may be adjusted to match the new unit's pricing.
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Target Property</label>
            {isLoadingProperties ? (
              <p className="text-sm text-slate-500">Loading properties...</p>
            ) : properties.length === 0 ? (
              <p className="text-sm text-slate-500">No properties available under your current management.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {properties.map((prop) => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedPropertyId(prop.id)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedPropertyId === prop.id ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm">{prop.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unit Selection */}
          {selectedPropertyId && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Available Unit</label>
              {isLoadingUnits ? (
                <p className="text-sm text-slate-500">Loading available units...</p>
              ) : availableUnits.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 font-bold">No available units</p>
                  <p className="text-xs text-amber-700 mt-1">This property has no vacant units at the moment.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUnits.map((unit) => (
                    <label key={unit.id} className={`block p-3 border rounded-lg cursor-pointer transition-colors ${selectedUnitId === unit.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="targetUnit" checked={selectedUnitId === unit.id} onChange={() => setSelectedUnitId(unit.id)} className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 flex justify-between">
                          <div>
                            <p className="font-bold text-slate-800">{unit.unit_code}</p>
                            <p className="text-xs text-slate-500">{unit.unit_type?.replace("_", " ")} • Floor {unit.floor_number}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-800">KES {Number(unit.rent_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Move-in Date</label>
              <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} min={today} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Transfer *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="e.g., Growing family, need an extra bedroom..." className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-700">{error}</p></div>}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting || !selectedUnitId || !reason.trim()} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </div>
      </div>
    </div>
  );
}