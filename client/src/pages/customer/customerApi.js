
import axios from "axios";

// ==========================================
// CUSTOMER API CONFIGURATION
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const customerApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==========================================
// REQUEST INTERCEPTOR
// Attach JWT token automatically
// ==========================================

customerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handle API errors
// ==========================================

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "Customer API Error:",
        error.response.data?.message || error.response.statusText
      );
    } else if (error.request) {
      console.error("Server is not responding. Check your backend.");
    } else {
      console.error("API Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ==========================================
// SERVICES
// ==========================================

export const getServices = async () => {
  const response = await customerApi.get("/services");

  return response.data.services || response.data;
};

// ==========================================
// STAFF / PROFESSIONALS
// ==========================================

export const getStaff = async () => {
  const response = await customerApi.get("/staff");

  return response.data.staff || response.data;
};

// ==========================================
// CREATE NEW BOOKING
// ==========================================

export const createBooking = async (bookingData) => {
  const response = await customerApi.post(
    "/bookings",
    bookingData
  );

  return response.data.booking || response.data;
};

// ==========================================
// GET MY BOOKINGS
// Backend route: GET /api/bookings/my
// ==========================================

export const getMyBookings = async () => {
  const response = await customerApi.get("/bookings/my");

  return response.data.bookings || response.data;
};

// ==========================================
// GET SINGLE BOOKING DETAILS
// Backend route: GET /api/bookings/:id
// ==========================================

export const getBookingById = async (id) => {
  const response = await customerApi.get(
    `/bookings/${id}`
  );

  return response.data.booking || response.data;
};

// ==========================================
// CANCEL BOOKING
// Backend route: PATCH /api/bookings/:id/cancel
// ==========================================

export const cancelBooking = async (id) => {
  const response = await customerApi.patch(
    `/bookings/${id}/cancel`
  );

  return response.data;
};

// ==========================================
// CUSTOMER PROFILE
// ==========================================

export const getMyProfile = async () => {
  const response = await customerApi.get("/auth/me");

  return response.data.user || response.data;
};

// ==========================================
// UPDATE CUSTOMER PROFILE
// Backend must support PUT /api/auth/profile
// ==========================================

export const updateMyProfile = async (profileData) => {
  const response = await customerApi.put(
    "/auth/profile",
    profileData
  );

  return response.data.user || response.data;
};

// ==========================================
// EXPORT AXIOS INSTANCE
// ==========================================

export default customerApi;
