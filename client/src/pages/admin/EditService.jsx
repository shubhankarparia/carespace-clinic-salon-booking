
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { PageHeader, FormField, getError } from "./AdminComponents";

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", category: "", description: "",
    price: "", duration: "", isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/services/${id}`);
        const item = response.data?.data || response.data;
        setForm({
          name: item.name || "",
          category: item.category || "",
          description: item.description || "",
          price: item.price ?? "",
          duration: item.duration ?? "",
          isActive: item.isActive ?? true
        });
      } catch (err) {
        setError(getError(err, "Unable to load service."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/services/${id}`, {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration)
      });
      navigate("/admin/services");
    } catch (err) {
      setError(getError(err, "Unable to update service."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-page-content">Loading service...</div>;

  return (
    <div className="admin-page-content">
      <PageHeader title="Edit Service" subtitle="Update service information." icon="bi-pencil-square" />
      <div className="admin-form-card">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="row">
            <div className="col-md-6">
              <FormField label="Service Name" name="name" value={form.name} onChange={change} required />
            </div>
            <div className="col-md-6">
              <FormField label="Category" name="category" value={form.category} onChange={change} required options={[
                { value: "clinic", label: "Clinic" },
                { value: "salon", label: "Salon" }
              ]} />
            </div>
            <div className="col-md-6">
              <FormField label="Price (₹)" name="price" type="number" min="0" value={form.price} onChange={change} required />
            </div>
            <div className="col-md-6">
              <FormField label="Duration (minutes)" name="duration" type="number" min="1" value={form.duration} onChange={change} required />
            </div>
            <div className="col-12">
              <FormField label="Description" name="description" type="textarea" value={form.description} onChange={change} />
            </div>
            <div className="col-12 mb-3">
              <label className="form-check">
                <input className="form-check-input" type="checkbox" name="isActive" checked={form.isActive} onChange={change} />
                <span className="form-check-label">Active service</span>
              </label>
            </div>
          </div>
          <button className="btn btn-primary me-2" disabled={saving}>
            {saving ? "Updating..." : "Update Service"}
          </button>
          <button type="button" className="btn btn-light" onClick={() => navigate("/admin/services")}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
