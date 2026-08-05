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
  isHydrating: boolean;
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
  isHydrating: !!Cookies.get("access_token"),
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

      const draftString = typeof window !== "undefined" ? localStorage.getItem("tennacy-onboarding-draft") : null;
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

      const safeUser = {
        ...user,
        email: user?.email || user?.contact_email,
        full_name: user?.full_name || user?.name,
        phone_number: user?.phone_number || user?.profile?.phone_number,
        role: user?.role,
        profile_complete:
          user?.profile_complete ?? user?.profile?.profile_complete ?? false,
      };

      set({ user: safeUser as User, isAuthenticated: true, isLoading: false, isHydrating: false });

      const stateData = await get().fetchUserState();
      set({ userState: stateData });

      if (stateData) {
        set({
          user: {
            ...safeUser,
            profile_complete: stateData.profile_complete ?? safeUser.profile_complete,
            role: stateData.role || safeUser.role,
          } as User,
        });
      }

      return stateData?.next_route || null;
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.message ||
          "Invalid email or password.",
        isLoading: false,
        isHydrating: false,
      });
      return null;
    }
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ user: null, isAuthenticated: false, userState: null, isHydrating: false });
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

  initializeAuth: async () => {
    const hasToken = !!Cookies.get("access_token");
    
    if (!hasToken) {
      set({ isHydrating: false, isAuthenticated: false });
      return null;
    }

    set({ isHydrating: true, isLoading: true, isAuthenticated: true });

    try {
      const profileResponse = await apiClient.get(endpoints.PROFILE.ME);
      const rawData = profileResponse.data;

      const baseData = rawData?.user || rawData?.profile || rawData;

      const userData = {
        ...baseData,
        email: baseData.email || baseData.contact_email,
        full_name: baseData.full_name || baseData.name,
        role: baseData.role,
        phone_number: baseData.phone_number || baseData.profile?.phone_number,
        profile_complete: baseData.profile_complete ?? false,
      };

      set({ user: userData as User });

      const stateData = await get().fetchUserState();
      
      set({ 
        userState: stateData,
        user: {
          ...userData,
          profile_complete: stateData?.profile_complete ?? userData.profile_complete,
          role: stateData?.role || userData.role
        } as User
      });

      return stateData?.next_route || null;
    } catch (error) {
      console.error("❌ Hydration failed (Token invalid or expired):", error);
      get().logout();
      return null;
    } finally {
      set({ isHydrating: false, isLoading: false });
    }
  },
}));

// Auto-hydrate on store initialization if token exists
if (typeof window !== "undefined" && Cookies.get("access_token")) {
  const store = useAuthStore.getState();
  if (store.isHydrating && !store.user) {
    store.initializeAuth();
  }
}