
import api from "./api";

const adminService = {
  // Dashboard.
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  // Customers.
  getCustomers: async (params = {}) => {
    const response = await api.get("/admin/customers", {
      params
    });

    return response.data;
  },

  // Holidays.
  getHolidays: async () => {
    const response = await api.get("/admin/holidays");
    return response.data;
  },

  addHoliday: async (holidayData) => {
    const response = await api.post(
      "/admin/holidays",
      holidayData
    );

    return response.data;
  },

  deleteHoliday: async (id) => {
    const response = await api.delete(
      `/admin/holidays/${encodeURIComponent(id)}`
    );

    return response.data;
  },

  // Working schedule.
  getSchedule: async () => {
    const response = await api.get("/admin/schedule");
    return response.data;
  },

  updateSchedule: async (scheduleData) => {
    const response = await api.put(
      "/admin/schedule",
      scheduleData
    );

    return response.data;
  },

  // Business settings.
  getSettings: async () => {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await api.put(
      "/admin/settings",
      settingsData
    );

    return response.data;
  },

  // Reports.
  getReports: async (params = {}) => {
    const response = await api.get("/admin/reports", {
      params
    });

    return response.data;
  }
};

export default adminService;
