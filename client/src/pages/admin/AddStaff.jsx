
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { PageHeader, FormField, getError } from "./AdminComponents";

// ==========================================
// STAFF ROLE OPTIONS
// ==========================================
const staffRoles = {
  clinic: [
    { value: "Doctor", label: "Doctor" },
    { value: "Dentist", label: "Dentist" },
    { value: "Nurse", label: "Nurse" },
    { value: "Physiotherapist", label: "Physiotherapist" },
    { value: "Receptionist", label: "Receptionist" },
    { value: "Lab Technician", label: "Lab Technician" },
  ],

  salon: [
    { value: "Hair Stylist", label: "Hair Stylist" },
    { value: "Beautician", label: "Beautician" },
    { value: "Makeup Artist", label: "Makeup Artist" },
    { value: "Hair Therapist", label: "Hair Therapist" },
    { value: "Nail Technician", label: "Nail Technician" },
    { value: "Receptionist", label: "Receptionist" },
  ],
};

export default function AddStaff() {
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    role: "",
    specialization: "",
    qualification: "",
    experience: 0,
    bio: "",
    consultationFee: 0,
    isAvailable: true,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================
  const change = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      setForm((old) => ({
        ...old,
        category: value,
        role: "",
        specialization: "",
      }));

      return;
    }

    setForm((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // FORM SUBMISSION
  // ==========================================
  const submit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter the staff member's full name.");
      return;
    }

    if (!form.category) {
      setError("Please select a department.");
      return;
    }

    if (!form.role) {
      setError("Please select a staff role.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      category: form.category,
      role: form.role,
      specialization: form.specialization.trim(),
      qualification: form.qualification.trim(),
      experience: Number(form.experience) || 0,
      bio: form.bio.trim(),
      consultationFee: Number(form.consultationFee) || 0,
      isAvailable: form.isAvailable,
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      const response = await api.post("/staff", payload);

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Unable to add staff member."
        );
      }

      navigate("/admin/staff");
    } catch (err) {
      console.error("Add staff error:", err);

      setError(
        getError(err, "Unable to add staff member. Please try again.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="admin-page-content">

      <PageHeader
        title="Add Staff Member"
        subtitle="Register a doctor or salon professional."
        icon="bi-person-plus"
      />

      <div className="admin-form-card">

        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
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
                placeholder="Enter full name"
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
                placeholder="Enter email address"
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
                placeholder="Enter phone number"
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

            {/* STAFF ROLE */}
            <div className="col-md-6">
              <FormField
                label="Staff Role"
                name="role"
                value={form.role}
                onChange={change}
                required
                options={staffRoles[form.category] || []}
              />
            </div>

            {/* SPECIALIZATION */}
            <div className="col-md-6">
              <FormField
                label="Specialization"
                name="specialization"
                value={form.specialization}
                onChange={change}
                placeholder={
                  form.category === "salon"
                    ? "e.g. Hair Styling, Skin Care"
                    : "e.g. General Medicine, Cardiology"
                }
              />
            </div>

            {/* QUALIFICATION */}
            <div className="col-md-6">
              <FormField
                label="Qualification"
                name="qualification"
                value={form.qualification}
                onChange={change}
                placeholder="e.g. MBBS, BDS, Diploma"
              />
            </div>

            {/* EXPERIENCE */}
            <div className="col-md-6">
              <FormField
                label="Experience (Years)"
                name="experience"
                type="number"
                value={form.experience}
                onChange={change}
                placeholder="Enter experience"
              />
            </div>

            {/* CONSULTATION FEE */}
            <div className="col-md-6">
              <FormField
                label="Consultation Fee (₹)"
                name="consultationFee"
                type="number"
                value={form.consultationFee}
                onChange={change}
                placeholder="Enter fee"
              />
            </div>

            {/* BIO */}
            <div className="col-12">
              <FormField
                label="Staff Description"
                name="bio"
                value={form.bio}
                onChange={change}
                placeholder="Write a short staff description"
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
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus me-2"></i>
                  Save Staff
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
