
import api from "./api";

const bookingService = {
  // Check available appointment slots.
  getAvailability: async (params) => {
    const response = await api.get("/bookings/availability", {
      params
    });

    return response.data;
  },

  // Create appointment.
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  // Get logged-in customer's bookings.
  getMyBookings: async (params = {}) => {
    const response = await api.get("/bookings/my-bookings", {
      params
    });

    return response.data;
  },

  // Get booking details.
  getBookingById: async (id) => {
    const response = await api.get(
      `/bookings/${encodeURIComponent(id)}`
    );

    return response.data;
  },

  // Cancel appointment.
  cancelBooking: async (id, reason = "") => {
    const response = await api.patch(
      `/bookings/${encodeURIComponent(id)}/cancel`,
      { reason }
    );

    return response.data;
  },

  // Admin: get all bookings.
  getAllBookings: async (params = {}) => {
    const response = await api.get("/admin/bookings", {
      params
    });

    return response.data;
  },

  // Admin: update booking status.
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(
      `/admin/bookings/${encodeURIComponent(id)}/status`,
      { status }
    );

    return response.data;
  },

  // Admin: cancel booking.
  adminCancelBooking: async (id, reason = "") => {
    const response = await api.patch(
      `/admin/bookings/${encodeURIComponent(id)}/cancel`,
      { reason }
    );

    return response.data;
  }
};

export default bookingService;
