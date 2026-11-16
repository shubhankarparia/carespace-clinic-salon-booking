
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

export const AuthContext = createContext(null);

const getResponseData = (response) => {
  return response?.data?.data || response?.data || {};
};

const getAuthPayload = (response) => {
  const data = getResponseData(response);

  return {
    token: data.token || data.accessToken || "",
    user: data.user || null,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === "admin";

  // Fetch logged-in user
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setToken(null);
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get("/auth/me");

      const data = getResponseData(response);
      const currentUser = data.user || data;

      if (!currentUser?._id && !currentUser?.id && !currentUser?.email) {
        throw new Error("Invalid user response from server.");
      }

      setToken(savedToken);
      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error(
        "Fetch Current User Error:",
        error.response?.data || error.message
      );

      localStorage.removeItem("token");

      setToken(null);
      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize authentication
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Login
  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const result = getAuthPayload(response);

    if (!result.token) {
      throw new Error(
        "Login response did not contain an authentication token."
      );
    }

    // Save token before fetching the user.
    localStorage.setItem("token", result.token);
    setToken(result.token);

    let loggedInUser = result.user;

    if (!loggedInUser?._id && !loggedInUser?.id && !loggedInUser?.email) {
      const meResponse = await api.get("/auth/me");
      const meData = getResponseData(meResponse);

      loggedInUser = meData.user || meData;
    }

    if (
      !loggedInUser?._id &&
      !loggedInUser?.id &&
      !loggedInUser?.email
    ) {
      throw new Error("Unable to retrieve your user profile.");
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    const response = await api.post("/auth/register", userData);

    const result = getAuthPayload(response);

    // Automatically authenticate only if backend returns a token.
    if (result.token) {
      localStorage.setItem("token", result.token);
      setToken(result.token);

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
      } else {
        await fetchCurrentUser();
      }
    }

    return result.user;
  }, [fetchCurrentUser]);

  // Logout
  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      console.error(
        "Logout API Error:",
        error.response?.data || error.message
      );
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    const response = await api.patch("/users/me", profileData);

    const data = getResponseData(response);
    const updatedUser = data.user || data;

    setUser((previous) => ({
      ...previous,
      ...updatedUser,
    }));

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        ...updatedUser,
      })
    );

    return updatedUser;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      fetchCurrentUser,
      updateProfile,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      fetchCurrentUser,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
