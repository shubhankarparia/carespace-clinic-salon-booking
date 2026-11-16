
import api from "./api";

const staffService = {
  // Get all staff.
  getAllStaff: async (params = {}) => {
    const response = await api.get("/staff", { params });
    return response.data;
  },

  // Get clinic professionals.
  getClinicStaff: async () => {
    const response = await api.get("/staff", {
      params: {
        category: "clinic",
        isActive: true
      }
    });

    return response.data;
  },

  // Get salon professionals.
  getSalonStaff: async () => {
    const response = await api.get("/staff", {
      params: {
        category: "salon",
        isActive: true
      }
    });

    return response.data;
  },

  // Get staff assigned to a service.
  getStaffByService: async (serviceId) => {
    const response = await api.get(
      `/staff/service/${encodeURIComponent(serviceId)}`
    );

    return response.data;
  },

  // Get staff details.
  getStaffById: async (id) => {
    const response = await api.get(
      `/staff/${encodeURIComponent(id)}`
    );

    return response.data;
  },

  // Admin: add staff.
  createStaff: async (staffData) => {
    const response = await api.post("/staff", staffData);
    return response.data;
  },

  // Admin: update staff.
  updateStaff: async (id, staffData) => {
    const response = await api.put(
      `/staff/${encodeURIComponent(id)}`,
      staffData
    );

    return response.data;
  },

  // Admin: delete staff.
  deleteStaff: async (id) => {
    const response = await api.delete(
      `/staff/${encodeURIComponent(id)}`
    );

    return response.data;
  }
};

export default staffService;
