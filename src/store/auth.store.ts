import { create } from "zustand";
import Cookies from "js-cookie";
import { authApi } from "@/api/auth.api";
import { LoginRequest, User } from "@/types/auth.types";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userState: any | null;

  login: (data: LoginRequest) => Promise<string | null>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  fetchUserState: () => Promise<any>;
  initializeAuth: () => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: !!Cookies.get("access_token"),
  isLoading: false,
  error: null,
  userState: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(data);
      const { access, refresh, user } = response as any;

      if (!access) throw new Error("No access token received from backend.");

      Cookies.set("access_token", access, { expires: 1 });
      if (refresh) Cookies.set("refresh_token", refresh, { expires: 7 });

      // Smart wipe for onboarding drafts
      const draftString = localStorage.getItem("tennacy-onboarding-draft");
      if (draftString) {
        try {
          const draft = JSON.parse(draftString);
          if (draft?.state?.userId && draft.state.userId !== user.id) {
            localStorage.removeItem("tennacy-onboarding-draft");
          }
        } catch (e) {
          localStorage.removeItem("tennacy-onboarding-draft");
        }
      }

      set({ user: user || null, isAuthenticated: true, isLoading: false });

      const stateData = await get().fetchUserState();
      set({ userState: stateData });
      return stateData?.next_route || null;
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.message ||
          "Invalid email or password.",
        isLoading: false,
      });
      return null;
    }
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ user: null, isAuthenticated: false, userState: null });
    if (typeof window !== "undefined") window.location.href = "/login";
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),

  fetchUserState: async () => {
    try {
      const response = await apiClient.get(endpoints.AUTH.USER_STATE);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user state", error);
      return null;
    }
  },

  // ✅ FIXED: Bulletproof initialization for page refreshes
  initializeAuth: async () => {
    if (!get().isAuthenticated) return null;

    if (!get().user) {
      try {
        set({ isLoading: true });
        const profileResponse = await apiClient.get(endpoints.PROFILE.ME);
        const rawData = profileResponse.data;

        // 🚨 BULLETPROOF MERGER:
        // Handles nested user objects AND polymorphic profiles (e.g., Agency has 'name' instead of 'full_name')
        const userData = {
          ...rawData,
          ...(rawData.user ? rawData.user : {}), // Flatten if nested under 'user' key

          // Map alternative field names to standard expected fields
          email: rawData.email || rawData.user?.email || rawData.contact_email,
          full_name:
            rawData.full_name || rawData.user?.full_name || rawData.name,
          role: rawData.role || rawData.user?.role,
        };

        set({ user: userData, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch user profile on refresh", error);
        set({ isLoading: false });
        get().logout(); // Token is invalid/expired
        return null;
      }
    }

    try {
      const stateData = await get().fetchUserState();
      set({ userState: stateData });
      return stateData?.next_route || null;
    } catch (error) {
      return null;
    }
  },
}));
