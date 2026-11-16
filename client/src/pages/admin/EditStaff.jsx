
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

import {
  PageHeader,
  FormField,
  getError,
} from "./AdminComponents";

export default function EditStaff() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    specialization: "",
    isAvailable: true,
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD STAFF DETAILS
  // ==========================================

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/staff/${id}`);

        const item =
          response.data?.data || response.data;

        setForm({
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          category: item.category || "",
          specialization: item.specialization || "",
          isAvailable: item.isAvailable ?? true,
          isActive: item.isActive ?? true,
        });
      } catch (err) {
        setError(
          getError(err, "Unable to load staff member.")
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const change = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // UPDATE STAFF
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        specialization: form.specialization.trim(),
      };

      await api.put(`/staff/${id}`, payload);

      navigate("/admin/staff");
    } catch (err) {
      setError(
        getError(err, "Unable to update staff member.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="admin-page-content">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />

          <p className="text-muted mt-3">
            Loading staff details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="admin-page-content">

      <PageHeader
        title="Edit Staff Member"
        subtitle="Update professional details and staff availability."
        icon="bi-pencil-square"
      />

      <div className="admin-form-card">

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2" />
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <div className="row">

            {/* FULL NAME */}

            <div className="col-md-6">
              <FormField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={change}
                required
              />
            </div>

            {/* EMAIL */}

            <div className="col-md-6">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={change}
                required
              />
            </div>

            {/* PHONE */}

            <div className="col-md-6">
              <FormField
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={change}
                required
              />
            </div>

            {/* DEPARTMENT */}

            <div className="col-md-6">
              <FormField
                label="Department"
                name="category"
                value={form.category}
                onChange={change}
                required
                options={[
                  { value: "clinic", label: "Clinic" },
                  { value: "salon", label: "Salon" },
                ]}
              />
            </div>

            {/* SPECIALIZATION */}

            <div className="col-12">
              <FormField
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={change}
              />
            </div>

            {/* AVAILABILITY */}

            <div className="col-12 mb-3">
              <label className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={change}
                />

                <span className="form-check-label">
                  Available for bookings
                </span>
              </label>

              <small className="text-muted ms-4">
                Controls whether customers can book this staff member.
              </small>
            </div>

            {/* ACTIVE STAFF MEMBER */}

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
                  Active staff member
                </span>
              </label>

              <small className="text-muted ms-4">
                Controls whether this staff member is active in the system.
              </small>
            </div>

          </div>

          {/* ACTION BUTTONS */}

          <div className="d-flex flex-wrap gap-2">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Updating...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2" />
                  Update Staff
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate("/admin/staff")}
              disabled={saving}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
