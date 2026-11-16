
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const extractServices = (response) => {
  const data = response?.data?.data || response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

export default function useServices(filters = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const category = filters.category || "";
  const search = filters.search || "";
  const activeOnly = filters.activeOnly ?? true;

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (category && category !== "all") {
        params.category = category;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      if (activeOnly) {
        params.isActive = true;
      }

      const response = await api.get("/services", { params });
      const result = extractServices(response);

      setServices(result);
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load services.";

      setError(message);
      setServices([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [category, search, activeOnly]);

  useEffect(() => {
    fetchServices().catch(() => {});
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    refetch: fetchServices
  };
}
