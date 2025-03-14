import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

// Define interface for custom config
interface CustomApiConfig extends AxiosRequestConfig {
  customHeaders?: Record<string, string>;
}

// Base configuration
class ApiConfig {
  static readonly BASE_URL: string = process.env.EXPO_PUBLIC_API_URL || "";
  static readonly DEFAULT_TIMEOUT: number = 15000;
}

// Function to get JWT token from SecureStore
const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("accessToken");
};

const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("refreshToken");
};

// Create a single axios instance
const createAxiosInstance = (config: CustomApiConfig = {}): AxiosInstance => {
  if (!ApiConfig.BASE_URL) {
    console.warn("Missing EXPO_PUBLIC_API_URL in .env file");
  }

  return axios.create({
    baseURL: ApiConfig.BASE_URL,
    timeout: ApiConfig.DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.customHeaders,
      ...config.headers,
    },
    ...config,
  });
};

// Create a single instance with JWT authentication
const createAuthInstance = (config: CustomApiConfig = {}): AxiosInstance => {
  const instance = createAxiosInstance(config);

  // Request interceptor for adding auth token
  instance.interceptors.request.use(
    async (
      reqConfig: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> => {
      try {
        const token = await getAccessToken();
        if (token && reqConfig.headers) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
      } catch (error) {
        console.error("Error in request interceptor:", error);
        return reqConfig;
      }
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for handling common errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 Unauthorized errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = await getRefreshToken();
          console.log(ApiConfig.BASE_URL);
          if (refreshToken) {
            const response = await axios.post(
              `${ApiConfig.BASE_URL}/auth/refresh`,
              {
                refreshToken,
              },
            );

            const { accessToken } = response.data;

            // Save the new token
            await SecureStore.setItemAsync("accessToken", accessToken);

            // Update the Authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Retry the original request
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);

          // Clear auth data on refresh token failure
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("user");

          // Redirect to login
          router.replace("/login/loginScreen");
        }
      }

      // Handle other common errors
      if (error.response) {
        // Server responded with an error status code
        console.error(
          "Response error:",
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Request error (no response):", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Create and export instances
const axiosInstance = createAuthInstance();
const axiosPublicInstance = createAxiosInstance();

export {
  createAxiosInstance,
  createAuthInstance,
  axiosPublicInstance,
  axiosInstance as default,
};
