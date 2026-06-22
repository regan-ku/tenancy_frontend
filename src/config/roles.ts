/**
 * Defines the exact user roles supported by the Tennacy platform.
 * These must match the backend `UserRole` choices exactly.
 */
export enum UserRole {
  ADMIN = "admin",
  LANDLORD = "landlord",
  AGENCY = "agency",
  AGENT = "agent",
  CARETAKER = "caretaker",
  TENANT = "tenant",
}

/**
 * Helper array for quick role checks (e.g., filtering dropdowns)
 */
export const ALL_ROLES = Object.values(UserRole);

/**
 * Roles that require business/identity verification before accessing operational features.
 */
export const VERIFICATION_REQUIRED_ROLES = [UserRole.LANDLORD, UserRole.AGENCY];

/**
 * Roles that have property management capabilities.
 */
export const PROPERTY_MANAGER_ROLES = [
  UserRole.ADMIN,
  UserRole.LANDLORD,
  UserRole.AGENCY,
  UserRole.AGENT,
];
