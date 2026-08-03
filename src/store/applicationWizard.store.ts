import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApplicationType = "rental" | "transfer" | "eviction";

export interface ApplicationFormData {
  // Auto-populated from profile
  full_name: string;
  phone_number: string;
  email: string;

  // Manager mode applicant ID: the ID of the tenant being applied for
  applicant: number | null;

  // Property & unit selection
  propertyId: number | null;
  unitGroupId: number | null;
  preferredFloor: number | null;
  target_unit_id: number | null;
  target_unit_code: string | null;
  target_unit_rent: string | null;
  target_unit_deposit: string | null;
  current_unit_id: number | null;

  // Conditional fields based on application type
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

  /*
    wizardLocked can be used by the UI to prevent accidental browser navigation.
    It should NOT default to true in a way that blocks the wizard from opening.
  */
  wizardLocked: boolean;

  /*
    Optional helper state for hydration and redirect continuity.
  */
  hasHydrated: boolean;
  intendedRedirect: string | null;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  setApplicationType: (type: ApplicationType) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;

  setTermsAccepted: (accepted: boolean) => void;
  setSubmitting: (status: boolean) => void;
  setError: (error: string | null) => void;
  setShowStepValidation: (show: boolean) => void;

  setWizardLocked: (locked: boolean) => void;
  lockWizard: () => void;
  unlockWizard: () => void;

  setHasHydrated: (hydrated: boolean) => void;
  setIntendedRedirect: (path: string | null) => void;

  initializeApplication: (
    type: ApplicationType,
    context?: Partial<ApplicationFormData>,
  ) => void;

  hydrateApplicantFromProfile: (profile: {
    full_name?: string;
    phone_number?: string;
    email?: string;
  }) => void;

  resetWizard: () => void;
}

const initialFormData: ApplicationFormData = {
  full_name: "",
  phone_number: "",
  email: "",
  applicant: null,

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

const initialWizardState = {
  currentStep: 1,
  applicationType: null as ApplicationType | null,
  formData: { ...initialFormData },
  termsAccepted: false,
  isSubmitting: false,
  error: null as string | null,
  showStepValidation: false,
  wizardLocked: false,
  hasHydrated: false,
  intendedRedirect: null as string | null,
};

export const useApplicationWizardStore = create<ApplicationWizardStore>()(
  persist(
    (set, get) => ({
      ...initialWizardState,

      nextStep: () =>
        set((state) => ({
          currentStep: state.currentStep + 1,
          error: null,
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1),
          error: null,
        })),

      goToStep: (step) =>
        set(() => ({
          currentStep: Math.max(1, step),
          error: null,
        })),

      setApplicationType: (type) => set({ applicationType: type }),

      updateFormData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...data,
          },
        })),

      setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
      setSubmitting: (status) => set({ isSubmitting: status }),
      setError: (error) => set({ error }),
      setShowStepValidation: (show) => set({ showStepValidation: show }),

      setWizardLocked: (locked) => set({ wizardLocked: locked }),
      lockWizard: () => set({ wizardLocked: true }),
      unlockWizard: () => set({ wizardLocked: false }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setIntendedRedirect: (path) => set({ intendedRedirect: path }),

      /*
        Use this when opening the wizard from a listing, unit card,
        dashboard action, or manager flow.

        Example:
        initializeApplication("rental", {
          propertyId: 12,
          target_unit_id: 45,
          target_unit_code: "A-101",
        })
      */
      initializeApplication: (type, context = {}) =>
        set((state) => ({
          applicationType: type,
          currentStep: 1,
          termsAccepted: false,
          error: null,
          showStepValidation: false,
          wizardLocked: false,
          formData: {
            ...state.formData,
            ...context,
          },
        })),

      /*
        Use this after login or after fetching profile,
        so the wizard does not ask the user to re-enter basic details.
      */
      hydrateApplicantFromProfile: (profile) =>
        set((state) => ({
          formData: {
            ...state.formData,
            full_name: profile.full_name ?? state.formData.full_name,
            phone_number: profile.phone_number ?? state.formData.phone_number,
            email: profile.email ?? state.formData.email,
          },
        })),

      resetWizard: () =>
        set({
          ...initialWizardState,
          formData: { ...initialFormData },
        }),
    }),
    {
      name: "tenancy-application-wizard-draft",

      /*
        Only persist the actual draft data.
        Do NOT persist loading states, validation flags, or lock states.
      */
      partialize: (state) => ({
        applicationType: state.applicationType,
        formData: state.formData,
        termsAccepted: state.termsAccepted,
        currentStep: state.currentStep,
      }),

      /*
        This merge prevents old persisted state from causing freezes.

        If the persisted draft is incomplete or stale:
        - isSubmitting is forced false
        - wizardLocked is forced false
        - currentStep is forced to a valid number
        - formData is merged safely with defaults
      */
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ApplicationWizardStore>;

        return {
          ...currentState,
          ...persisted,
          formData: {
            ...currentState.formData,
            ...(persisted.formData ?? {}),
          },
          currentStep: Math.max(1, persisted.currentStep ?? 1),
          isSubmitting: false,
          error: null,
          showStepValidation: false,
          wizardLocked: false,
          hasHydrated: true,
        };
      },
    },
  ),
);