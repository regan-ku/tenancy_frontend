import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import env from "@/config/env";

// 1. Create the base Axios instance
const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15000, // 15 seconds timeout
  // ✅ FIX: Removed global "Content-Type": "application/json" header.
  // We will set it dynamically in the interceptor to avoid breaking FormData uploads.
});

// 2. Request Interceptor: Attach JWT Token & Handle Content-Type
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅🚨 CRITICAL FIX FOR FILE UPLOADS:
    // If the payload is FormData (file upload), we MUST delete the Content-Type header.
    // This allows the browser to automatically set 'multipart/form-data'
    // along with the cryptographic 'boundary' that Django needs to parse the file.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      // For normal JSON requests, ensure Content-Type is set
      if (config.headers) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 3. Response Interceptor: Handle 401 Unauthorized & Token Refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      const refreshToken = Cookies.get("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${env.API_URL}/accounts/refresh/`,
            {
              refresh: refreshToken,
            },
          );

          const newAccessToken = response.data.access;

          // Save new token
          Cookies.set("access_token", newAccessToken, { expires: 1 }); // 1 day

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");

          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
        }
      } else {
        // No refresh token, just redirect to login
        Cookies.remove("access_token");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
