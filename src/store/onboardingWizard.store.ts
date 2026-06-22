import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DirectorData {
  id?: string;
  full_name: string;
  id_number: string;
  phone_number: string;
  email: string;
  ownership_percentage: string;
  nationality: string; // ✅ ADDED
  address: string; // ✅ ADDED
}

export interface OnboardingData {
  full_name: string;
  id_number: string;
  date_of_birth: string;
  nationality: string;
  business_name: string;
  registration_number: string;
  business_email: string;
  phone_number: string;
  address: string;
  next_of_kin_name: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
  next_of_kin_city: string;
  directors: DirectorData[];

  // ✅ FIX 1: Documents are Files, but KRA PIN is a STRING
  id_document_front: File | null;
  id_document_back: File | null;
  kra_pin: string; // ✅ CHANGED FROM File | null
  kra_tax_compliance_cert: File | null;
  business_registration: File | null;
  agency_license: File | null;
}

interface OnboardingWizardStore {
  userId: string | null;
  currentStep: number;
  userRole: "tenant" | "landlord" | "agency" | null;
  formData: OnboardingData;
  isSubmitting: boolean;
  error: string | null;

  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingData>) => void;
  setUserRole: (role: "tenant" | "landlord" | "agency") => void;
  setUserId: (id: string) => void;
  addDirector: (director: DirectorData) => void;
  removeDirector: (id: string) => void;
  setSubmitting: (status: boolean) => void;
  setError: (error: string | null) => void;
  resetWizard: () => void;
  getTotalSteps: () => number;
}

const initialFormData: OnboardingData = {
  full_name: "",
  id_number: "",
  date_of_birth: "",
  nationality: "",
  business_name: "",
  registration_number: "",
  business_email: "",
  phone_number: "+254",
  address: "",
  next_of_kin_name: "",
  next_of_kin_relationship: "",
  next_of_kin_phone: "+254",
  next_of_kin_city: "",
  directors: [],
  id_document_front: null,
  id_document_back: null,
  kra_pin: "", // ✅ FIX 2: CHANGED FROM null to an empty string
  kra_tax_compliance_cert: null,
  business_registration: null,
  agency_license: null,
};

export const useOnboardingWizardStore = create<OnboardingWizardStore>()(
  persist(
    (set, get) => ({
      userId: null,
      currentStep: 1,
      userRole: null,
      formData: initialFormData,
      isSubmitting: false,
      error: null,

      nextStep: () =>
        set((state) => {
          const maxSteps = state.getTotalSteps();
          if (state.currentStep >= maxSteps) return state;
          return { currentStep: state.currentStep + 1 };
        }),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1),
        })),

      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setUserRole: (role) => set({ userRole: role }),
      setUserId: (userId) => set({ userId }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setError: (error) => set({ error }),

      addDirector: (director) =>
        set((state) => ({
          formData: {
            ...state.formData,
            directors: [
              ...state.formData.directors,
              { ...director, id: crypto.randomUUID() },
            ],
          },
        })),
      removeDirector: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            directors: state.formData.directors.filter((d) => d.id !== id),
          },
        })),

      getTotalSteps: () => (get().userRole === "tenant" ? 3 : 4),

      resetWizard: () =>
        set({
          userId: null,
          currentStep: 1,
          userRole: null,
          formData: initialFormData,
          error: null,
          isSubmitting: false,
        }),
    }),
    {
      name: "tennacy-onboarding-draft",
      version: 3,

      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            userId: null,
            currentStep: 1,
            userRole: null,
            formData: initialFormData,
            isSubmitting: false,
            error: null,
          };
        }
        return persistedState;
      },

      partialize: (state) => ({
        formData: {
          ...state.formData,
          id_document_front: null,
          id_document_back: null,
          // ✅ FIX 3: REMOVED kra_pin FROM THIS LIST!
          // Because it's now a string, we WANT it to be saved to localStorage.
          // If we leave it here, it will be wiped to null every time the user refreshes.
          kra_tax_compliance_cert: null,
          business_registration: null,
          agency_license: null,
        },
        currentStep: state.currentStep,
        userRole: state.userRole,
        userId: state.userId,
      }),
    },
  ),
);
