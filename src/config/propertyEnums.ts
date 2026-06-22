// Extracted directly from your OpenAPI Schema (Pasted_Text_1781511408648.txt)

export const PROPERTY_CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "hospitality", label: "Hospitality (Short Stay/Hotels)" },
  { value: "industrial", label: "Industrial" },
  { value: "land", label: "Land & Plots" },
  { value: "mixed_use", label: "Mixed Use" },
];

export const PROPERTY_SUB_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "flat", label: "Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "mansion", label: "Mansion" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
  { value: "maisonette", label: "Maisonette" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio Apartment" },
  { value: "single_room", label: "Single Room" },
  { value: "hostel", label: "Student Hostel" },
  { value: "office_space", label: "Office Space" },
  { value: "retail_shop", label: "Retail Shop" },
  { value: "warehouse", label: "Warehouse" },
  { value: "airbnb", label: "Airbnb / Vacation Rental" },
  { value: "hotel", label: "Hotel" },
  { value: "residential_plot", label: "Residential Plot" },
];

export const CONSTRUCTION_TYPES = [
  { value: "concrete", label: "Concrete" },
  { value: "stone", label: "Stone" },
  { value: "steel", label: "Steel" },
  { value: "timber", label: "Timber" },
  { value: "mixed", label: "Mixed" },
];

export const UNIT_TYPES = [
  { value: "single_room", label: "Single Room" },
  { value: "bedsitter", label: "Bedsitter" },
  { value: "studio", label: "Studio" },
  { value: "one_bedroom", label: "1 Bedroom" },
  { value: "two_bedroom", label: "2 Bedrooms" },
  { value: "three_bedroom", label: "3 Bedrooms" },
  { value: "four_plus_bedroom", label: "4+ Bedrooms" },
  { value: "penthouse", label: "Penthouse" },
  { value: "commercial_space", label: "Commercial Space" },
];

// ✅ BILLING CYCLE OPTIONS (As requested)
export const BILLING_CYCLES = [
  { value: "daily", label: "Daily (Short Stay)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

// Single unit sub-types that skip the Unit Group Wizard
export const SINGLE_UNIT_SUB_TYPES = [
  "mansion",
  "bungalow",
  "villa",
  "townhouse",
  "maisonette",
  "residential_plot",
  "commercial_land",
];
