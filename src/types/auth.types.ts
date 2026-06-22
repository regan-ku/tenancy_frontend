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
 * This tells the frontend exactly where to route the user after login.
 */
export interface UserStateResponse {
  profile_complete: boolean;
  role: string;
  next_route: string;
  message: string;
}

/**
 * Basic User interface for global state.
 */
export interface User {
  id: number;
  email: string;
  role: string;
  is_verified: boolean;
  profile_complete: boolean;
}
