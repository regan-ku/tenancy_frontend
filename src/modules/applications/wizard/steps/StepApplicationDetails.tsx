"use client";

import React, { useEffect, useState } from "react";
import { useApplicationWizardStore } from "@/store/applicationWizard.store";
import { propertiesApi } from "@/api/properties.api";

export default function StepApplicationDetails() {
  const { applicationType, formData, updateFormData } =
    useApplicationWizardStore();

  const [availableFloors, setAvailableFloors] = useState<number[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [floorError, setFloorError] = useState<string | null>(null);

  // ✅ FIX: Pass floorsList as an argument to prevent stale state closures
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
      const unitTypeLabel = formData.unitGroupId
        ? "units of this type"
        : "units";

      setFloorError(
        nextAvailableFloor
          ? `No ${unitTypeLabel} available on floor ${floor}. Please try floor ${nextAvailableFloor}.`
          : `No ${unitTypeLabel} available on floor ${floor}.`,
      );
      // ✅ FIX: Use target_unit_id instead of selectedUnitId
      updateFormData({ preferredFloor: floor, target_unit_id: null });
    } else {
      setFloorError(null);
      const randomUnit =
        unitsOnFloor[Math.floor(Math.random() * unitsOnFloor.length)];
      // ✅ FIX: Use target_unit_id instead of selectedUnitId
      updateFormData({ preferredFloor: floor, target_unit_id: randomUnit.id });
    }
  };

  useEffect(() => {
    const fetchUnits = async () => {
      if (!formData.propertyId || !formData.unitGroupId) return;

      setIsLoadingUnits(true);
      try {
        const response = await propertiesApi.getUnits(formData.propertyId);
        const availableUnits = response.results.filter(
          (u: any) =>
            u.unit_group === formData.unitGroupId && u.status === "available",
        );

        const floors = [
          ...new Set(availableUnits.map((u: any) => u.floor_number)),
        ].sort((a, b) => a - b);
        setAvailableFloors(floors);

        if (formData.preferredFloor) {
          filterUnitsByFloor(availableUnits, formData.preferredFloor, floors);
        }
      } catch (err) {
        console.error("Failed to fetch units", err);
      } finally {
        setIsLoadingUnits(false);
      }
    };
    fetchUnits();
  }, [formData.propertyId, formData.unitGroupId]);

  const handleFloorSelect = (floor: number) => {
    propertiesApi.getUnits(formData.propertyId!).then((response) => {
      const availableUnits = response.results.filter(
        (u: any) =>
          u.unit_group === formData.unitGroupId && u.status === "available",
      );
      filterUnitsByFloor(availableUnits, floor, availableFloors);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  if (!applicationType)
    return (
      <div className="text-center text-slate-500 py-12">
        Loading application details...
      </div>
    );

  return (
    <div className="space-y-6">
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
        {/* --- AUTO-POPULATED PROFILE FIELDS (Read-Only) --- */}
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

        {/* --- SMART FLOOR SELECTION (Rental & Transfer) --- */}
        {(applicationType === "rental" || applicationType === "transfer") && (
          <div className="md:col-span-2 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            {/* ✅ FIX: Fixed the broken 0> tag to </h3> */}
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
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-slate-100"
                >
                  <option value="">Select a floor</option>
                  {availableFloors.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
                {availableFloors.length === 0 && !isLoadingUnits && (
                  <p className="text-xs text-red-600 mt-1">
                    No available units of this type at the moment.
                  </p>
                )}
              </div>

              {/* ✅ FIX: Use target_unit_id instead of selectedUnitId */}
              {formData.target_unit_id && !floorError && (
                <div className="flex items-end">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                    <p className="text-xs text-green-700 font-semibold">
                      ✅ Unit Reserved for Application
                    </p>
                    <p className="text-sm text-green-800">
                      A specific unit on Floor {formData.preferredFloor} has
                      been tentatively assigned to your application.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ FALLBACK ERROR MESSAGE */}
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

        {/* --- CONDITIONAL FIELDS --- */}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
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
            </div>
          </>
        )}

        {applicationType === "transfer" && (
          <>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Transfer *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g., Need more space, relocating for work..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </>
        )}

        {applicationType === "eviction" && (
          <>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason for Notice / Eviction Request *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g., End of lease term, breach of contract..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </>
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
