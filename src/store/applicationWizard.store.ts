import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApplicationType = "rental" | "transfer" | "eviction";

export interface ApplicationFormData {
  // Auto-populated from profile
  full_name: string;
  phone_number: string;
  email: string;

  // Property & Unit Selection
  propertyId: number | null;
  unitGroupId: number | null;
  preferredFloor: number | null;
  target_unit_id: number | null; // ✅ ADDED: The unit being applied for
  current_unit_id: number | null; // ✅ ADDED: For transfer applications (optional)

  // Conditional Fields based on Application Type
  anticipated_move_in_date: string; // Rental, Transfer
  anticipated_move_out_date: string; // Transfer, Eviction
  employment_status: string; // Rental only
  reason: string; // Transfer (reason for transfer), Eviction (reason for notice)
  notes: string; // Optional additional context
}

export interface ApplicationWizardStore {
  currentStep: number;
  applicationType: ApplicationType | null;

  formData: ApplicationFormData;
  termsAccepted: boolean;
  isSubmitting: boolean;
  error: string | null;

  nextStep: () => void;
  prevStep: () => void;
  setApplicationType: (type: ApplicationType) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setSubmitting: (status: boolean) => void;
  setError: (error: string | null) => void;
  resetWizard: () => void;
}

const initialFormData: ApplicationFormData = {
  full_name: "",
  phone_number: "",
  email: "",
  propertyId: null,
  unitGroupId: null,
  preferredFloor: null,
  target_unit_id: null,
  current_unit_id: null, // ✅ ADDED
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

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

      setApplicationType: (type) => set({ applicationType: type }),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
      setSubmitting: (status) => set({ isSubmitting: status }),
      setError: (error) => set({ error }),

      resetWizard: () =>
        set({
          currentStep: 1,
          applicationType: null,
          formData: initialFormData,
          termsAccepted: false,
          isSubmitting: false,
          error: null,
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
