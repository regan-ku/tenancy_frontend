import { PropertyWizardData } from "@/store/propertyWizard.store";

export const validateWizardStep = (
  step: number,
  data: PropertyWizardData,
): string | null => {
  switch (step) {
    case 1:
      if (!data.title || !data.property_category || !data.property_sub_type)
        return "Please fill in all required basic information.";
      return null;
    case 2:
      if (!data.location.city || !data.location.county)
        return "City and County are required.";
      return null;
    case 3:
      if (data.total_units_capacity <= 0)
        return "Total unit capacity must be greater than 0.";
      return null;
    case 4:
      if (data.unit_groups.length === 0)
        return "Please add at least one unit group.";
      return null;
    default:
      return null;
  }
};
