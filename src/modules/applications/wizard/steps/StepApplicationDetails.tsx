"use client";

import React, { useEffect, useState } from "react";
import { useApplicationWizardStore } from "@/store/applicationWizard.store";
import { propertiesApi } from "@/api/properties.api";

export default function StepApplicationDetails() {
  const { applicationType, formData, updateFormData, showStepValidation } =
    useApplicationWizardStore();

  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [floorError, setFloorError] = useState<string | null>(null);

  const filterUnitsByFloor = (
    allAvailableUnits: any[],
    floor: number,
    floorsList: number[],
  ) => {
    const unitsOnFloor = allAvailableUnits.filter(
      (u: any) => u.floor_number === floor,
    );

    if (unitsOnFloor.length === 0) {
      const nextAvailableFloor =
        floorsList.find((f) => f > floor) || floorsList[0];
      setFloorError(
        nextAvailableFloor
          ? `No units available on floor ${floor}. Please try floor ${nextAvailableFloor}.`
          : `No units available on floor ${floor}.`,
      );
      updateFormData({
        preferredFloor: floor,
        target_unit_id: null,
        target_unit_code: null,
        target_unit_rent: null, // ✅ CLEAR FINANCIALS
        target_unit_deposit: null, // ✅ CLEAR FINANCIALS
      });
    } else {
      setFloorError(null);
      const randomUnit =
        unitsOnFloor[Math.floor(Math.random() * unitsOnFloor.length)];

      // ✅ SAVE FINANCIALS TO STORE alongside the unit ID
      updateFormData({
        preferredFloor: floor,
        target_unit_id: randomUnit.id,
        target_unit_code: randomUnit.unit_code,
        target_unit_rent: randomUnit.rent_amount,
        target_unit_deposit: randomUnit.deposit_amount,
      });
    }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.propertyId || !formData.unitGroupId) return;

      setIsLoadingUnits(true);
      try {
        const response = await propertiesApi.getUnits(formData.propertyId);
        const allUnits = response.results || [];

        const units = allUnits.filter(
          (u: any) =>
            (u.unit_group === formData.unitGroupId ||
              u.unit_group_id === formData.unitGroupId) &&
            u.status === "available",
        );

        setAvailableUnits(units);

        const floors = [...new Set(units.map((u: any) => u.floor_number))].sort(
          (a, b) => a - b,
        );

        setAvailableFloors(floors);

        if (floors.length > 0 && !formData.preferredFloor) {
          filterUnitsByFloor(units, floors[0], floors);
        } else if (formData.preferredFloor) {
          filterUnitsByFloor(units, formData.preferredFloor, floors);
        }
      } catch (err: any) {
        // ✅ SILENCE 401 & CANCELED ERRORS:
        // If it's a 401, the session is dead and the user is being redirected.
        // If it's 'canceled' or 'ECONNABORTED', the browser killed the request during redirect.
        const is401 = err.response?.status === 401;
        const isCanceled =
          err.code === "ECONNABORTED" || err.message === "canceled";

        if (!is401 && !isCanceled) {
          console.error("Failed to fetch units", err);
        }
      } finally {
        setIsLoadingUnits(false);
      }
    };
    fetchUnits();
  }, [formData.propertyId, formData.unitGroupId]);

  const handleFloorSelect = (floor: number) => {
    filterUnitsByFloor(availableUnits, floor, availableFloors);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const unitGroupName =
    availableUnits.length > 0
      ? availableUnits[0].unit_group_name ||
        `Unit Group ${formData.unitGroupId}`
      : `Unit Group ${formData.unitGroupId}`;

  if (!applicationType)
    return (
      <div className="text-center text-slate-500 py-12">
        Loading application details...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* PROPERTY & UNIT SUMMARY CARD */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-5">
        <h3 className="text-sm font-bold text-primary-dark uppercase tracking-wide mb-3">
          Application Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Property ID</p>
            <p className="font-bold text-slate-800">#{formData.propertyId}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Unit Type</p>
            <p className="font-bold text-slate-800 capitalize">
              {unitGroupName.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">Application Type</p>
            <p className="font-bold text-slate-800 capitalize">
              {applicationType}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Application Details
        </h2>
        <p className="text-slate-500">
          Your profile information has been auto-populated. Please complete the
          specific details for this {applicationType} request.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AUTO-POPULATED PROFILE FIELDS (Read-Only) */}
        <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
            Applicant Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                readOnly
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone_number}
                readOnly
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* SMART FLOOR SELECTION */}
        {(applicationType === "rental" || applicationType === "transfer") && (
          <div className="md:col-span-2 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h3 className="text-sm font-semibold text-primary-dark mb-3 flex items-center gap-2">
              🏢 Unit & Floor Preference
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Floor *
                </label>
                <select
                  value={formData.preferredFloor || ""}
                  onChange={(e) => handleFloorSelect(Number(e.target.value))}
                  required
                  disabled={isLoadingUnits || availableFloors.length === 0}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-slate-100 ${showStepValidation && !formData.target_unit_id ? "border-red-500" : "border-slate-300"}`}
                >
                  <option value="">Select a floor</option>
                  {availableFloors.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
                {showStepValidation && !formData.target_unit_id && (
                  <p className="text-xs text-red-600 mt-1">
                    Please select a floor.
                  </p>
                )}
                {availableFloors.length === 0 && !isLoadingUnits && (
                  <p className="text-xs text-red-600 mt-1">
                    No available units of this type at the moment.
                  </p>
                )}
              </div>

              {formData.target_unit_id && !floorError && (
                <div className="flex items-end">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                    <p className="text-xs text-green-700 font-semibold">
                      ✅ Unit Reserved for Application
                    </p>
                    <p className="text-sm text-green-800">
                      Unit{" "}
                      <strong>
                        {formData.target_unit_code || formData.target_unit_id}
                      </strong>{" "}
                      on Floor {formData.preferredFloor} has been tentatively
                      assigned.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {floorError && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
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
                  {floorError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CONDITIONAL FIELDS */}
        {applicationType === "rental" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Anticipated Move-In Date *
              </label>
              <input
                type="date"
                name="anticipated_move_in_date"
                value={formData.anticipated_move_in_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${showStepValidation && !formData.anticipated_move_in_date ? "border-red-500" : "border-slate-300"}`}
              />
              {showStepValidation && !formData.anticipated_move_in_date && (
                <p className="text-xs text-red-600 mt-1">
                  Move-in date is required.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employment Status *
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white ${showStepValidation && !formData.employment_status ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="">Select Status</option>
                <option value="employed_full_time">Employed (Full-Time)</option>
                <option value="employed_part_time">Employed (Part-Time)</option>
                <option value="self_employed">
                  Self-Employed / Business Owner
                </option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
              </select>
              {showStepValidation && !formData.employment_status && (
                <p className="text-xs text-red-600 mt-1">
                  Employment status is required.
                </p>
              )}
            </div>
          </>
        )}

        {applicationType === "transfer" && (
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Anticipated Move-Out Date (Current) *
                </label>
                <input
                  type="date"
                  name="anticipated_move_out_date"
                  value={formData.anticipated_move_out_date}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${showStepValidation && !formData.anticipated_move_out_date ? "border-red-500" : "border-slate-300"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Anticipated Move-In Date (New) *
                </label>
                <input
                  type="date"
                  name="anticipated_move_in_date"
                  value={formData.anticipated_move_in_date}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${showStepValidation && !formData.anticipated_move_in_date ? "border-red-500" : "border-slate-300"}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Transfer *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none ${showStepValidation && !formData.reason ? "border-red-500" : "border-slate-300"}`}
              />
            </div>
          </div>
        )}

        {applicationType === "eviction" && (
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Anticipated Move-Out / Termination Date *
              </label>
              <input
                type="date"
                name="anticipated_move_out_date"
                value={formData.anticipated_move_out_date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${showStepValidation && !formData.anticipated_move_out_date ? "border-red-500" : "border-slate-300"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Notice / Eviction Request *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none ${showStepValidation && !formData.reason ? "border-red-500" : "border-slate-300"}`}
              />
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Any other relevant information..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
