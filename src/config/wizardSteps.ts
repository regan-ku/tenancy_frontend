export interface WizardStep {
  id: number;
  title: string;
  description: string;
  skipForSingleUnit?: boolean;
}

export const PROPERTY_WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Basic Info",
    description: "Property name, category, and type",
  },
  {
    id: 2,
    title: "Location",
    description: "Address, city, and county details",
  },
  {
    id: 3,
    title: "Structure & Amenities",
    description: "Floors, capacity, and features",
  },
  {
    id: 4,
    title: "Unit Groups",
    description: "Bulk unit generation and pricing",
    skipForSingleUnit: true,
  },
  {
    id: 5,
    title: "Media & Documents",
    description: "Photos, videos, and ownership proofs",
  },
  {
    id: 6,
    title: "Publish & Marketplace",
    description: "Final review and public listing",
  },
];
