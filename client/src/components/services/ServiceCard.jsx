
import React from "react";
import { Link } from "react-router-dom";
import { money } from "../../utils/format.js";

export default function ServiceCard({ service, onBook }) {
  if (!service) return null;

  const serviceId = service._id || service.id;
  const serviceName = service.name || "Unnamed Service";
  const category = service.category || "general";

  const handleBook = () => {
    if (onBook) {
      onBook(service);
    }
  };

  return (
    <div className="card service-card h-100 border-0 shadow-sm">
      <div className="service-card-image d-flex align-items-center justify-content-center bg-light">
        <i
          className={`bi ${
            category.toLowerCase() === "clinic"
              ? "bi-heart-pulse"
              : "bi-scissors"
          } display-3 text-primary`}
        />
      </div>

      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary-subtle text-primary text-capitalize">
            {category}
          </span>

          <span className="text-muted small">
            <i className="bi bi-clock me-1" />
            {service.duration || 30} min
          </span>
        </div>

        <h5 className="fw-bold mb-2">{serviceName}</h5>

        <p className="text-muted small flex-grow-1">
          {service.description || "Professional service for your needs."}
        </p>

        <div className="d-flex align-items-center justify-content-between mt-3">
          <div>
            <small className="text-muted d-block">Starting from</small>
            <h5 className="fw-bold text-primary mb-0">
              {money(service.price)}
            </h5>
          </div>

          <Link
            to={`/services/${serviceId}`}
            className="btn btn-outline-primary btn-sm"
          >
            Details
          </Link>
        </div>

        <button
          type="button"
          className="btn btn-primary w-100 mt-3"
          onClick={handleBook}
        >
          <i className="bi bi-calendar-check me-2" />
          Book Appointment
        </button>
      </div>
    </div>
  );
}
