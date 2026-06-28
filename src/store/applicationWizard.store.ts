import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApplicationType = "rental" | "transfer" | "eviction";

export interface ApplicationFormData {
  // Auto-populated from profile
  full_name: string;
  phone_number: string;
  email: string;

  // ✅ NEW: Manager Mode Applicant ID (The ID of the newly created tenant)
  applicant: number | null;

  // Property & Unit Selection
  propertyId: number | null;
  unitGroupId: number | null;
  preferredFloor: number | null;
  target_unit_id: number | null;
  target_unit_code: string | null;
  target_unit_rent: string | null;
  target_unit_deposit: string | null;
  current_unit_id: number | null;

  // Conditional Fields based on Application Type
  anticipated_move_in_date: string;
  anticipated_move_out_date: string;
  employment_status: string;
  reason: string;
  notes: string;
}

export interface ApplicationWizardStore {
  currentStep: number;
  applicationType: ApplicationType | null;

  formData: ApplicationFormData;
  termsAccepted: boolean;
  isSubmitting: boolean;
  error: string | null;
  showStepValidation: boolean;
  wizardLocked: boolean; // ✅ ADDED: Controls the browser navigation lock

  nextStep: () => void;
  prevStep: () => void;
  setApplicationType: (type: ApplicationType) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setSubmitting: (status: boolean) => void;
  setError: (error: string | null) => void;
  setShowStepValidation: (show: boolean) => void;
  setWizardLocked: (locked: boolean) => void; // ✅ ADDED
  resetWizard: () => void;
}

const initialFormData: ApplicationFormData = {
  full_name: "",
  phone_number: "",
  email: "",
  applicant: null, // ✅ NEW: Initialize applicant as null
  propertyId: null,
  unitGroupId: null,
  preferredFloor: null,
  target_unit_id: null,
  target_unit_code: null,
  target_unit_rent: null,
  target_unit_deposit: null,
  current_unit_id: null,
  anticipated_move_in_date: "",
  anticipated_move_out_date: "",
  employment_status: "",
  reason: "",
  notes: "",
};

export const useApplicationWizardStore = create<ApplicationWizardStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      applicationType: null,
      formData: initialFormData,
      termsAccepted: false,
      isSubmitting: false,
      error: null,
      showStepValidation: false,
      wizardLocked: true, // ✅ ADDED: Locked by default while in the wizard

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      setApplicationType: (type) => set({ applicationType: type }),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
      setSubmitting: (status) => set({ isSubmitting: status }),
      setError: (error) => set({ error }),
      setShowStepValidation: (show) => set({ showStepValidation: show }),
      setWizardLocked: (locked) => set({ wizardLocked: locked }), // ✅ ADDED

      resetWizard: () =>
        set({
          currentStep: 1,
          applicationType: null,
          formData: initialFormData,
          termsAccepted: false,
          isSubmitting: false,
          error: null,
          showStepValidation: false,
          wizardLocked: true, // Resets to locked for the next session
        }),
    }),
    {
      name: "tennacy-application-wizard-draft",
      partialize: (state) => ({
        applicationType: state.applicationType,
        formData: state.formData,
        termsAccepted: state.termsAccepted,
        currentStep: state.currentStep,
      }),
    },
  ),
);
