
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { PageHeader, FormField, getError } from "./AdminComponents";

const createSlug = (value = "") => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function AddService() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    isActive: true
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const change = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((old) => ({
      ...old,
      [name]:
        type === "checkbox"
          ? checked
          : name === "name"
            ? value
            : value,
      ...(name === "name" ? { slug: createSlug(value) } : {})
    }));

    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter a service name.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a valid service slug.");
      return;
    }

    if (!["clinic", "salon"].includes(form.category)) {
      setError("Please select a valid category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a service description.");
      return;
    }

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (form.price === "" || !Number.isFinite(price) || price < 0) {
      setError("Please enter a valid service price.");
      return;
    }

    if (
      form.duration === "" ||
      !Number.isInteger(duration) ||
      duration < 5
    ) {
      setError("Service duration must be at least 5 minutes.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: createSlug(form.slug),
        category: form.category,
        description: form.description.trim(),
        price,
        duration
      };

      await api.post("/services", payload);

      setSuccess("Service created successfully.");

      setTimeout(() => {
        navigate("/admin/services");
      }, 800);

    } catch (err) {
      const backendErrors = err.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length) {
        setError(backendErrors.join(" "));
      } else {
        setError(
          getError(err, "Unable to create service. Please try again.")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page-content">
      <PageHeader
        title="Add Service"
        subtitle="Create a clinic or salon service."
        icon="bi-plus-circle"
      />

      <div className="admin-form-card">
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle me-2" />
            {success}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="row">

            <div className="col-md-6">
              <FormField
                label="Service Name"
                name="name"
                value={form.name}
                onChange={change}
                placeholder="e.g. Hair Cut"
                required
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Service Slug"
                name="slug"
                value={form.slug}
                onChange={change}
                placeholder="e.g. hair-cut"
                required
              />
              <small className="text-muted">
                URL-friendly name. Automatically generated from the service name.
              </small>
            </div>

            <div className="col-md-6">
              <FormField
                label="Category"
                name="category"
                value={form.category}
                onChange={change}
                required
                options={[
                  { value: "clinic", label: "Clinic" },
                  { value: "salon", label: "Salon" }
                ]}
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={change}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="col-md-6">
              <FormField
                label="Duration (minutes)"
                name="duration"
                type="number"
                min="5"
                value={form.duration}
                onChange={change}
                placeholder="e.g. 30"
                required
              />
            </div>

            <div className="col-12">
              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={form.description}
                onChange={change}
                placeholder="Enter service description..."
                required
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={change}
                />
                <span className="form-check-label">
                  Active service
                </span>
              </label>
            </div>

          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2" />
                  Save Service
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-light"
              disabled={saving}
              onClick={() => navigate("/admin/services")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
