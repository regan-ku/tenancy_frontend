/**
 * Request payload for logging in.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response payload containing JWT tokens from the backend.
 */
export interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Response from the User State Resolution Engine.
 * This tells the frontend exactly where to route the user after login/onboarding.
 */
export interface UserStateResponse {
  profile_complete: boolean;
  tenant_profile_complete?: boolean; // Used to determine if a tenant can rent (DOB + NOK)
  role: string;
  next_route: string;
  message: string;
}

/**
 * Comprehensive User interface for global state.
 * Merges core identity fields from the User model and essential fields from the Profile model.
 * This prevents TypeScript errors when accessing profile data in the frontend.
 */
export interface User {
  // ==========================================
  // CORE IDENTITY (From User Model)
  // ==========================================
  id: number;
  email: string;
  role: string; // e.g., 'tenant', 'landlord', 'agency', 'agent', 'caretaker', 'admin'
  is_verified: boolean;
  is_active?: boolean;
  date_joined?: string;

  // ==========================================
  // PROFILE & STATE FLAGS
  // ==========================================
  profile_complete: boolean;

  // ==========================================
  // MERGED PROFILE FIELDS (Flattened by API or Store)
  // These are mapped in auth.store.ts from either the root object or nested profile
  // ==========================================
  full_name?: string;
  phone_number?: string;

  // ==========================================
  // OPTIONAL NESTED PROFILE OBJECT
  // Included in case the backend returns the profile as a nested object
  // ==========================================
  profile?: {
    id?: number;
    full_name?: string;
    phone_number?: string;
    nationality?: string;
    address?: string;
    date_of_birth?: string;
    profile_complete?: boolean;
  };
}
