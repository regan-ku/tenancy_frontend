import { create } from "zustand";
import { persist } from "zustand/middleware";
import { propertiesApi, UnitType, BillingCycle } from "@/api/properties.api";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
export interface UnitGroupDraft {
  id?: string;
  name: string;
  unit_type: UnitType;
  floor_range: string;
  billing_cycle: BillingCycle;
  billing_date: number;
  base_rent_amount: string;
  service_charge_amount: string;
  deposit_amount: string;
  capacity: number;
  units_per_floor?: number;
}

export interface LocationData {
  estate: string;
  street: string;
  city: string;
  county: string;
  postal_code: string;
  landmark: string;
}

export interface PropertyWizardData {
  title: string;
  description: string;
  property_category: string;
  property_sub_type: string;
  construction_type: string;
  is_single_unit_property: boolean;
  location: LocationData;
  number_of_floors: number;
  total_units_capacity: number;
  has_water: boolean;
  has_electricity: boolean;
  has_internet: boolean;
  has_cctv: boolean;
  has_elevator: boolean;
  has_generator: boolean;
  has_gym: boolean;
  has_swimming_pool: boolean;
  allows_pets: boolean;
  parking_spaces: number;
  unit_groups: UnitGroupDraft[];
}

interface PropertyWizardStore {
  currentStep: number;
  propertyId: number | null;
  formData: PropertyWizardData;
  isSubmitting: boolean;
  error: string | null;
  isDraftSaved: boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (data: Partial<PropertyWizardData>) => void;
  setPropertyId: (id: number) => void;
  saveProperty: () => Promise<void>;
  finalizeUnitGroups: () => Promise<boolean>;
  addUnitGroup: (group: UnitGroupDraft) => void;
  updateUnitGroup: (id: string, updatedGroup: UnitGroupDraft) => void;
  removeUnitGroup: (id: string) => void;
  setSubmitting: (status: boolean) => void;
  setError: (error: string | null) => void;
  setDraftSaved: (status: boolean) => void; // ✅ ADDED: Required for Draft Hydration
  resetWizard: () => void;
}

// ==========================================
// 2. CONSTANTS & HELPERS
// ==========================================
export const SINGLE_UNIT_SUB_TYPES = [
  "mansion",
  "bungalow",
  "villa",
  "townhouse",
  "maisonette",
  "residential_plot",
  "commercial_land",
  "agricultural_land",
];

export const calculateUnitsPerFloor = (
  totalUnits: number,
  startFloor: number,
  endFloor: number,
) => {
  const totalFloors = endFloor - startFloor + 1;
  if (totalFloors <= 0) return 0;
  return Math.ceil(totalUnits / totalFloors);
};

// ==========================================
// 3. INITIAL STATE
// ==========================================
const initialFormData: PropertyWizardData = {
  title: "",
  description: "",
  property_category: "residential",
  property_sub_type: "apartment",
  construction_type: "concrete",
  is_single_unit_property: false,
  location: {
    estate: "",
    street: "",
    city: "",
    county: "",
    postal_code: "",
    landmark: "",
  },
  number_of_floors: 1,
  total_units_capacity: 0,
  has_water: true,
  has_electricity: true,
  has_internet: false,
  has_cctv: false,
  has_elevator: false,
  has_generator: false,
  has_gym: false,
  has_swimming_pool: false,
  allows_pets: false,
  parking_spaces: 0,
  unit_groups: [],
};


// When uploading media files
const uploadMedia = async (files: FileList, propertyId: number) => {
  const formData = new FormData();
  
  // ✅ Append each file correctly
  Array.from(files).forEach((file, index) => {
    formData.append(`file_${index}`, file); // Or use 'file' if single upload
  });
  
  // Add metadata
  formData.append('property', propertyId.toString());
  formData.append('media_type', 'image'); // or video, etc.
  
  // Send to API
  await propertiesApi.uploadPropertyMedia(propertyId, formData);
};

// ==========================================
// 4. STORE CREATION
// ==========================================
export const usePropertyWizardStore = create<PropertyWizardStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      propertyId: null,
      formData: initialFormData,
      isSubmitting: false,
      error: null,
      isDraftSaved: false,

      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      goToStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setPropertyId: (id) => set({ propertyId: id }),
      setSubmitting: (isSubmitting) => set({ isSubmitting }),
      setError: (error) => set({ error }),
      setDraftSaved: (status) => set({ isDraftSaved: status }), // ✅ ADDED

      saveProperty: async () => {
        set({ isSubmitting: true, error: null });
        try {
          const data = get().formData;
          if (!data.title) throw new Error("Property Title is required.");
          if (!data.location.city) throw new Error("City is required.");
          if (!data.location.county) throw new Error("County is required.");

          const payload = {
            title: data.title,
            description: data.description,
            property_category: data.property_category,
            property_sub_type: data.property_sub_type,
            construction_type: data.construction_type,
            is_single_unit_property: data.is_single_unit_property,
            number_of_floors: data.number_of_floors,
            total_units_capacity: data.total_units_capacity,
            parking_spaces: data.parking_spaces,
            allows_pets: data.allows_pets,
            has_water: data.has_water,
            has_electricity: data.has_electricity,
            has_internet: data.has_internet,
            has_cctv: data.has_cctv,
            has_elevator: data.has_elevator,
            has_generator: data.has_generator,
            has_gym: data.has_gym,
            has_swimming_pool: data.has_swimming_pool,
            location: {
              city: data.location.city,
              county: data.location.county,
              estate: data.location.estate,
              street: data.location.street,
              postal_code: data.location.postal_code,
              landmark: data.location.landmark,
            },
          };

          const createdProperty = await propertiesApi.createProperty(payload);

          set({
            propertyId: createdProperty.id,
            isDraftSaved: true,
            error: null,
          });
        } catch (err: any) {
          set({
            error:
              err.response?.data?.detail ||
              err.message ||
              "Failed to save property.",
          });
        } finally {
          set({ isSubmitting: false });
        }
      },

      finalizeUnitGroups: async () => {
        const { propertyId, formData } = get();
        if (!propertyId) {
          set({ error: "Property must be saved before creating unit groups." });
          return false;
        }

        set({ isSubmitting: true, error: null });
        try {
          // 1. Send frontend drafts to the backend bridge
          const response = await propertiesApi.finalizeUnitGroups(propertyId, {
            unit_groups: formData.unit_groups,
          });

          // 2. ✅ CRITICAL: Map the backend response to update the frontend UUIDs with real Database IDs
          const updatedGroups = response.map((dbGroup: any, index: number) => {
            const draft = formData.unit_groups[index];
            return {
              ...draft,
              id: String(dbGroup.id), // ✅ Replace frontend UUID with real DB ID (as string)
            };
          });

          // 3. Update the store with the real DB IDs
          set((state) => ({
            formData: {
              ...state.formData,
              unit_groups: updatedGroups,
            },
            isSubmitting: false,
          }));

          return true;
        } catch (err: any) {
          set({
            error:
              err.response?.data?.error ||
              err.message ||
              "Failed to finalize unit groups.",
            isSubmitting: false,
          });
          return false;
        }
      },

      addUnitGroup: (group) =>
        set((state) => ({
          formData: {
            ...state.formData,
            unit_groups: [
              ...state.formData.unit_groups,
              { ...group, id: crypto.randomUUID() },
            ],
          },
        })),

      updateUnitGroup: (id, updatedGroup) =>
        set((state) => ({
          formData: {
            ...state.formData,
            unit_groups: state.formData.unit_groups.map((g) =>
              g.id === id ? { ...updatedGroup, id } : g,
            ),
          },
        })),

      removeUnitGroup: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            unit_groups: state.formData.unit_groups.filter((g) => g.id !== id),
          },
        })),

      resetWizard: () =>
        set({
          currentStep: 1,
          propertyId: null,
          formData: initialFormData,
          error: null,
          isDraftSaved: false,
        }),
    }),
    {
      name: "tennacy-property-wizard-draft",
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        propertyId: state.propertyId,
        isDraftSaved: state.isDraftSaved,
      }),
    },
  ),
);
