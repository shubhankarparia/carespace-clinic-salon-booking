
import React, { useEffect, useState } from "react";
import { CATEGORY_OPTIONS } from "../../utils/constants";
import {
  validateRequired,
  validatePrice,
  validateDuration
} from "../../utils/validators";

const initialForm = {
  name: "",
  category: "clinic",
  description: "",
  price: "",
  duration: 30,
  isActive: true
};

function ServiceForm({
  initialData = null,
  onSubmit = () => {},
  onCancel = () => {},
  loading = false
}) {
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialForm,
        ...initialData,
        price: initialData.price ?? "",
        duration: initialData.duration ?? 30
      });

      setPreview(initialData.image || "");
    } else {
      setForm(initialForm);
      setPreview("");
    }

    setImage(null);
    setErrors({});
  }, [initialData]);

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

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const validateForm = () => {
    const nextErrors = {};

    const nameError = validateRequired(form.name, "Service name");
    const priceError = validatePrice(form.price);
    const durationError = validateDuration(form.duration);
    const descriptionError = validateRequired(
      form.description,
      "Description"
    );

    if (nameError) nextErrors.name = nameError;
    if (priceError) nextErrors.price = priceError;
    if (durationError) nextErrors.duration = durationError;
    if (descriptionError) {
      nextErrors.description = descriptionError;
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
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration)
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
            {initialData ? "Edit Service" : "Add New Service"}
          </h5>
          <small className="text-muted">
            Enter the service information below.
          </small>
        </div>

        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Service Name *
              </label>
              <input
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. General Consultation"
                required
              />
              <div className="invalid-feedback">{errors.name}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Category *
              </label>
              <select
                className="form-select"
                name="category"
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
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-control ${errors.price ? "is-invalid" : ""}`}
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="500"
                required
              />
              <div className="invalid-feedback">{errors.price}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">{errors.duration}</div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Description *
              </label>
              <textarea
                rows="4"
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this service..."
                required
              />
              <div className="invalid-feedback">
                {errors.description}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Service Image
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
                  alt="Service preview"
                  className="rounded-3 mt-3"
                  style={{
                    width: "150px",
                    height: "110px",
                    objectFit: "cover"
                  }}
                />
              )}
            </div>

            <div className="col-12">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="serviceActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                <label
                  className="form-check-label fw-semibold"
                  htmlFor="serviceActive"
                >
                  Service is active and available for booking
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white border-0 p-4 d-flex flex-wrap gap-2 justify-content-end">
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
                {initialData ? "Update Service" : "Save Service"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ServiceForm;
