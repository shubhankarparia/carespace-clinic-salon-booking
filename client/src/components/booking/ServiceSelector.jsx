import React from "react";

export default function ServiceSelector({
  services = [],
  value,
  onChange,
  category,
  loading = false
}) {
  const filteredServices = services.filter(
    (service) =>
      !category ||
      service.category === category ||
      service.category === "both"
  );

  if (loading) {
    return (
      <div className="booking-inline-state">
        <span className="spinner-border spinner-border-sm"></span>
        Loading services...
      </div>
    );
  }

  if (!filteredServices.length) {
    return (
      <div className="booking-empty">
        No services available in this category.
      </div>
    );
  }

  return (
    <div className="booking-service-grid">
      {filteredServices.map((service) => {
        const id = service._id || service.id;

        return (
          <button
            type="button"
            key={id}
            className={`booking-service-card ${
              value === id ? "selected" : ""
            }`}
            onClick={() => onChange(id)}
          >
            <span className="booking-service-icon">
              <i className={`bi ${
                service.icon || "bi-stars"
              }`}></i>
            </span>

            <span className="booking-service-name">
              {service.name}
            </span>

            <span className="booking-service-description">
              {service.description || "Professional service"}
            </span>

            <span className="booking-service-meta">
              <strong>
                ₹{Number(service.price || 0).toLocaleString("en-IN")}
              </strong>

              <small>
                <i className="bi bi-clock"></i>
                {" "}{service.duration || 30} min
              </small>
            </span>

            {value === id && (
              <i className="bi bi-check-circle-fill booking-selected-mark"></i>
            )}
          </button>
        );
      })}
    </div>
  );
}