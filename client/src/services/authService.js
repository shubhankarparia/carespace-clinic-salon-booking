
import api from "./api";

const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    const data = response.data?.data || response.data;
    const token = data.token || data.accessToken;

    if (token) {
      localStorage.setItem("token", token);
    }

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put(
      "/auth/change-password",
      passwordData
    );

    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", {
      email
    });

    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(
      `/auth/reset-password/${encodeURIComponent(token)}`,
      { password }
    );

    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  isLoggedIn: () => {
    return Boolean(localStorage.getItem("token"));
  }
};

export default authService;
