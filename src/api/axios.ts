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
  timeout: 60000, 
});

// 🚨 NEW: Request Queue for handling multiple 401s simultaneously on refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Request Interceptor: Attach JWT Token & Handle Content-Type
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅🚨 CRITICAL FIX FOR FILE UPLOADS:
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If we get a 401 and haven't tried to refresh yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // 🚨 NEW: If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          // Note: Ensure this URL matches your exact backend refresh endpoint
          const response = await axios.post(
            `${env.API_URL}/accounts/refresh/`, 
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;

          // Save new token
          Cookies.set("access_token", newAccessToken, { expires: 1 });

          // 🚨 NEW: Process all queued requests with the new token
          processQueue(null, newAccessToken);

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 🚨 NEW: Reject all queued requests
          processQueue(refreshError, null);
          
          // If refresh fails, clear tokens and redirect to login
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");

          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/login")
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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