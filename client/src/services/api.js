
import axios from "axios";

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// Attach JWT token to every API request
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Attach authentication token
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData uploads
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (
      config.data &&
      typeof config.data === "object"
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handle API responses and errors
// ==========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      console.error("API Error:", {
        status,
        message,
        url: error.config?.url,
      });

      if (status === 401) {
        // Do not automatically remove the token here.
        // AuthContext handles authentication state.
        console.warn("Authentication failed or token expired.");
      }

      if (status === 403) {
        console.error("Access denied: insufficient permissions.");
      }

      if (status === 404) {
        console.error("API endpoint not found.");
      }

      if (status >= 500) {
        console.error("Internal backend server error.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("API request timed out.");
    } else if (error.request) {
      console.error("Unable to connect to the backend server.");
    } else {
      console.error("Request configuration error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ==========================================
// API ERROR MESSAGE HELPER
// ==========================================

export const getApiErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.errors) {
    const errors = responseData.errors;

    if (Array.isArray(errors)) {
      return errors
        .map((item) => item.msg || item.message || item)
        .filter(Boolean)
        .join(", ");
    }

    if (typeof errors === "object") {
      return Object.values(errors).flat().join(", ");
    }
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Please check that the backend is running.";
  }

  return "Something went wrong. Please try again.";
};

// ==========================================
// API CONFIGURATION EXPORT
// ==========================================

export { API_BASE_URL };

export default api;
