
import axios from "axios";

const authAPI = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5001/api",

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await authAPI.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Register API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await authAPI.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error(
      "Login API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await authAPI.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });

    return response.data;
  } catch (error) {
    console.error(
      "Forgot Password API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await authAPI.post(
      "/auth/reset-password",
      {
        token,
        password,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Reset Password API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default authAPI;
