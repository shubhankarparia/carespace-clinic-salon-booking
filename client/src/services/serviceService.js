
import api from "./api";

const serviceService = {
  // Get all services.
  getAllServices: async (params = {}) => {
    const response = await api.get("/services", { params });
    return response.data;
  },

  // Get active services.
  getActiveServices: async (category = "") => {
    const params = { isActive: true };

    if (category && category !== "all") {
      params.category = category;
    }

    const response = await api.get("/services", { params });
    return response.data;
  },

  // Get clinic services.
  getClinicServices: async () => {
    return serviceService.getAllServices({
      category: "clinic",
      isActive: true
    });
  },

  // Get salon services.
  getSalonServices: async () => {
    return serviceService.getAllServices({
      category: "salon",
      isActive: true
    });
  },

  // Get one service.
  getServiceById: async (id) => {
    const response = await api.get(
      `/services/${encodeURIComponent(id)}`
    );

    return response.data;
  },

  // Search services.
  searchServices: async (search) => {
    const response = await api.get("/services", {
      params: { search }
    });

    return response.data;
  },

  // Admin: create service.
  createService: async (serviceData) => {
    const response = await api.post("/services", serviceData);
    return response.data;
  },

  // Admin: update service.
  updateService: async (id, serviceData) => {
    const response = await api.put(
      `/services/${encodeURIComponent(id)}`,
      serviceData
    );

    return response.data;
  },

  // Admin: delete service.
  deleteService: async (id) => {
    const response = await api.delete(
      `/services/${encodeURIComponent(id)}`
    );

    return response.data;
  }
};

export default serviceService;
