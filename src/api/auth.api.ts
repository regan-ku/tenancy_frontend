import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { LoginRequest, TokenPair, UserStateResponse } from "@/types/auth.types";

export const authApi = {
  /**
   * Logs in a user and returns JWT tokens.
   */
  login: async (data: LoginRequest): Promise<TokenPair> => {
    const response = await apiClient.post(endpoints.AUTH.LOGIN, data);
    return response.data;
  },

  /**
   * Fetches the user's state to determine routing (Onboarding vs Dashboard).
   */
  getUserState: async (): Promise<UserStateResponse> => {
    const response = await apiClient.get(endpoints.AUTH.USER_STATE);
    return response.data;
  },
};
