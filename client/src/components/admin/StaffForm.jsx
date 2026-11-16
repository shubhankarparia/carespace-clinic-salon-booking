
import React, { useEffect, useState } from "react";
import { CATEGORY_OPTIONS } from "../../utils/constants";
import {
  validateName,
  validateEmail,
  validatePhone
} from "../../utils/validators";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  category: "clinic",
  specialization: "",
  experience: "",
  bio: "",
  isActive: true
};

function StaffForm({
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {},
  loading = false
}) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
        experience: initialData.experience ?? ""
      });

      setPreview(initialData.image || "");
    } else {
      setForm(initialForm);
      setPreview("");
    }

    setImage(null);
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: ""
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image: "Please select a valid image."
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        image: "Image must be smaller than 5 MB."
      }));
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));

    setErrors((previous) => ({
      ...previous,
      image: ""
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;

    if (!form.specialization.trim()) {
      nextErrors.specialization = "Specialization is required.";
    }

    if (
      form.experience !== "" &&
      (!Number.isInteger(Number(form.experience)) ||
        Number(form.experience) < 0 ||
        Number(form.experience) > 70)
    ) {
      nextErrors.experience = "Enter a valid experience in years.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.replace(/[\s-]/g, ""),
      specialization: form.specialization.trim(),
      experience:
        form.experience === "" ? 0 : Number(form.experience)
    };

    if (image) {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      formData.append("image", image);

      await onSubmit(formData);
    } else {
      await onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 p-4">
          <h5 className="fw-bold mb-1">
            {initialData ? "Edit Professional" : "Add New Professional"}
          </h5>
          <small className="text-muted">
            Enter the doctor or stylist details.
          </small>
        </div>

        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Full Name *
              </label>
              <input
                name="name"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
              <div className="invalid-feedback">{errors.name}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={handleChange}
                placeholder="professional@example.com"
                required
              />
              <div className="invalid-feedback">{errors.email}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength="10"
                required
              />
              <div className="invalid-feedback">{errors.phone}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category *
              </label>
              <select
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Specialization *
              </label>
              <input
                name="specialization"
                className={`form-control ${errors.specialization ? "is-invalid" : ""}`}
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g. Dermatologist / Hair Stylist"
                required
              />
              <div className="invalid-feedback">
                {errors.specialization}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                max="70"
                className={`form-control ${errors.experience ? "is-invalid" : ""}`}
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 5"
              />
              <div className="invalid-feedback">
                {errors.experience}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Biography
              </label>
              <textarea
                rows="3"
                name="bio"
                className="form-control"
                value={form.bio}
                onChange={handleChange}
                placeholder="Write a short professional biography..."
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="form-control"
                onChange={handleImageChange}
              />

              {errors.image && (
                <div className="text-danger small mt-1">
                  {errors.image}
                </div>
              )}

              {preview && (
                <img
                  src={preview}
                  alt="Professional profile preview"
                  className="rounded-circle mt-3"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover"
                  }}
                />
              )}
            </div>

            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="staffActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label
                  className="form-check-label fw-semibold"
                  htmlFor="staffActive"
                >
                  Professional is active
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white border-0 p-4 d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light px-4"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2" />
                {initialData ? "Update Professional" : "Add Professional"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default StaffForm;
