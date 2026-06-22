"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePropertyWizardStore,
  SINGLE_UNIT_SUB_TYPES,
} from "@/store/propertyWizard.store";
import { propertiesApi } from "@/api/properties.api";

import PropertyWizardGuard from "@/guards/propertyWizardGuard.guard";

import StepBasicInfo from "@/modules/properties/wizard/steps/StepBasicInfo";
import StepLocation from "@/modules/properties/wizard/steps/StepLocation";
import StepStructure from "@/modules/properties/wizard/steps/StepStructure";
import StepUnitGroups from "@/modules/properties/wizard/steps/StepUnitGroups";
import StepMedia from "@/modules/properties/wizard/steps/StepMedia";
import StepPublish from "@/modules/properties/wizard/steps/StepPublish";

// ✅ WRAPPED IN SUSPENSE: Required by Next.js for useSearchParams
export default function PropertyWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-muted">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <PropertyWizardContent />
    </Suspense>
  );
}

function PropertyWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdFromUrl = searchParams.get("property_id");

  const {
    currentStep,
    formData,
    isSubmitting,
    isDraftSaved,
    error,
    propertyId,
    nextStep,
    prevStep,
    goToStep,
    saveProperty,
    finalizeUnitGroups,
    setSubmitting,
    resetWizard,
    setError,
    setPropertyId,
    updateFormData,
    setDraftSaved, // ✅ Ensure this is destructured from your store
  } = usePropertyWizardStore();

  // ✅🚨 DRAFT HYDRATION: Resume exactly where you left off!
  useEffect(() => {
    const hydrateDraft = async () => {
      // If we have an ID from the URL (provided by backend user-state)
      // and the store is empty, fetch and hydrate.
      if (propertyIdFromUrl && !propertyId) {
        setSubmitting(true);
        try {
          // 1. Fetch the property draft
          const propertyData = await propertiesApi.getProperty(
            Number(propertyIdFromUrl),
          );

          const hydratedData = {
            title: propertyData.title || "",
            description: propertyData.description || "",
            property_category: propertyData.property_category || "residential",
            property_sub_type: propertyData.property_sub_type || "apartment",
            construction_type: propertyData.construction_type || "concrete",
            is_single_unit_property:
              propertyData.is_single_unit_property || false,
            number_of_floors: propertyData.number_of_floors || 1,
            total_units_capacity: propertyData.total_units_capacity || 0,
            parking_spaces: propertyData.parking_spaces || 0,
            allows_pets: propertyData.allows_pets || false,
            has_water: propertyData.has_water || false,
            has_electricity: propertyData.has_electricity || false,
            has_internet: propertyData.has_internet || false,
            has_cctv: propertyData.has_cctv || false,
            has_elevator: propertyData.has_elevator || false,
            has_generator: propertyData.has_generator || false,
            has_gym: propertyData.has_gym || false,
            has_swimming_pool: propertyData.has_swimming_pool || false,
            location: {
              estate: propertyData.location_details?.estate || "",
              street: propertyData.location_details?.street || "",
              city: propertyData.location_details?.city || "",
              county: propertyData.location_details?.county || "",
              postal_code: propertyData.location_details?.postal_code || "",
              landmark: (propertyData.location_details as any)?.landmark || "",
            },
          };

          updateFormData(hydratedData);
          setPropertyId(Number(propertyIdFromUrl));
          setDraftSaved(true); // Mark as saved so it doesn't create a new one at Step 3

          // 2. Fetch unit groups if they already exist
          try {
            const unitGroupsRes = await propertiesApi.getUnitGroups(
              Number(propertyIdFromUrl),
            );
            if (unitGroupsRes.results && unitGroupsRes.results.length > 0) {
              const groups = unitGroupsRes.results.map((ug) => ({
                id: String(ug.id), // Use real DB ID
                name: ug.name,
                unit_type: ug.unit_type,
                floor_range: ug.floor_range,
                billing_cycle: ug.billing_cycle,
                billing_date: ug.billing_date,
                base_rent_amount: ug.base_rent_amount,
                service_charge_amount: ug.service_charge_amount,
                deposit_amount: ug.deposit_amount,
                capacity: ug.capacity,
              }));
              updateFormData({ unit_groups: groups });
            }
          } catch (ugErr) {
            console.warn("No unit groups found or failed to fetch", ugErr);
          }
        } catch (err) {
          console.error("Failed to hydrate draft", err);
        } finally {
          setSubmitting(false);
        }
      }
    };

    hydrateDraft();
  }, [propertyIdFromUrl, propertyId]); // Only run when URL param changes or propertyId in store changes

  // Auto-skip Step 4 if it's a single unit property
  useEffect(() => {
    const isSingleUnit =
      SINGLE_UNIT_SUB_TYPES.includes(formData.property_sub_type) ||
      formData.is_single_unit_property;

    if (isSingleUnit && currentStep === 4) {
      goToStep(5); // Skip to Media
    }
  }, [
    formData.property_sub_type,
    formData.is_single_unit_property,
    currentStep,
    goToStep,
  ]);

  const handleNext = async () => {
    // CRITICAL: Save to DB before moving to Unit Groups (Step 4)
    if (currentStep === 3 && !isDraftSaved) {
      await saveProperty();
      if (usePropertyWizardStore.getState().isDraftSaved) {
        nextStep();
      }
      return;
    }

    // ✅🚨 STRICT VALIDATION & FINALIZATION FOR STEP 4 (UNIT GROUPS)
    if (currentStep === 4) {
      const groups = formData.unit_groups || [];
      const maxFloors = formData.number_of_floors || 1;
      const totalCap = formData.total_units_capacity || 0;
      const usedCap = groups.reduce((sum, g) => sum + g.capacity, 0);

      if (groups.length === 0) {
        setError("You must add at least one unit group to proceed.");
        return;
      }
      if (usedCap > totalCap) {
        setError(
          `Total unit capacity (${usedCap}) exceeds property capacity (${totalCap}).`,
        );
        return;
      }
      const floorError = groups.some(
        (g) => Number(g.floor_range.split("-")[1]) > maxFloors,
      );
      if (floorError) {
        setError(
          `Some unit groups have floor ranges exceeding the property's ${maxFloors} floors.`,
        );
        return;
      }

      // ✅ ARCHITECTURAL BRIDGE: Save Unit Groups to DB and Generate Units
      setSubmitting(true);
      setError("Saving unit groups and generating units...");

      const success = await finalizeUnitGroups();

      setSubmitting(false);
      if (!success) {
        setError(
          "Failed to save unit groups. Please check the data and try again.",
        );
        return;
      }

      setError(null);
    } else {
      setError(null);
    }

    nextStep();
  };

  const handleCancel = () => {
    if (
      confirm(
        "Exit wizard? Your draft is saved and will resume when you return.",
      )
    ) {
      router.push("/dashboard/landlord");
    }
  };

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo />;
      case 2:
        return <StepLocation />;
      case 3:
        return <StepStructure />;
      case 4:
        return <StepUnitGroups />;
      case 5:
        return <StepMedia />;
      case 6:
        return <StepPublish />;
      default:
        return <StepBasicInfo />;
    }
  };

  return (
    <PropertyWizardGuard>
      <div className="min-h-screen bg-surface-muted py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-primary-dark">
                Create New Property
              </h1>
              <button
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-red-500 font-medium"
              >
                Cancel & Exit
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-secondary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200 font-medium">
                ⚠️ {error}
              </div>
            )}
            {renderStep()}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="btn-outline px-6 py-2 disabled:opacity-50"
            >
              &larr; Back
            </button>

            <div className="flex gap-3 items-center">
              {isDraftSaved && (
                <span className="text-xs text-green-600 font-medium">
                  ✅ Saved to Database
                </span>
              )}
              {currentStep < totalSteps && (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-2 disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? "Processing..." : "Next Step"} &rarr;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PropertyWizardGuard>
  );
}
