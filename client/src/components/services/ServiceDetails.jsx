
import React from "react";
import { Link, useParams } from "react-router-dom";
import { services, staff } from "../../data/demoData.js";
import { money } from "../../utils/format.js";

export default function ServiceDetails() {
  const { id } = useParams();

  const service = services.find(
    (item) => String(item._id || item.id) === String(id)
  );

  if (!service) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle display-1 text-warning" />
        <h2 className="fw-bold mt-3">Service Not Found</h2>
        <p className="text-muted">
          The service you are looking for does not exist.
        </p>
        <Link to="/services" className="btn btn-primary">
          Browse Services
        </Link>
      </div>
    );
  }

  const category = service.category || "general";

  const availableStaff = staff.filter(
    (person) =>
      String(person.category || "").toLowerCase() ===
      String(category).toLowerCase()
  );

  const serviceId = service._id || service.id;

  return (
    <div className="service-details-page bg-light py-5">
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/services">Services</Link>
            </li>
            <li className="breadcrumb-item active">
              {service.name}
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="bg-primary-subtle d-flex justify-content-center align-items-center"
                style={{ minHeight: "260px" }}
              >
                <i
                  className={`bi ${
                    category.toLowerCase() === "clinic"
                      ? "bi-heart-pulse"
                      : "bi-scissors"
                  }`}
                  style={{ fontSize: "100px", color: "#4f46e5" }}
                />
              </div>

              <div className="card-body p-4 p-md-5">
                <span className="badge bg-primary text-capitalize mb-3">
                  {category}
                </span>

                <h1 className="fw-bold mb-3">{service.name}</h1>

                <p className="text-muted">
                  {service.description ||
                    "Professional service delivered by experienced experts."}
                </p>

                <hr className="my-4" />

                <div className="row g-4">
                  <div className="col-sm-6">
                    <div className="d-flex gap-3">
                      <i className="bi bi-currency-rupee fs-3 text-primary" />
                      <div>
                        <small className="text-muted">Service Price</small>
                        <h5 className="fw-bold">
                          {money(service.price)}
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="d-flex gap-3">
                      <i className="bi bi-clock fs-3 text-primary" />
                      <div>
                        <small className="text-muted">Duration</small>
                        <h5 className="fw-bold">
                          {service.duration || 30} minutes
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h4 className="fw-bold mb-3">
                  <i className="bi bi-people me-2 text-primary" />
                  Available Professionals
                </h4>

                {availableStaff.length > 0 ? (
                  <div className="row g-3">
                    {availableStaff.map((person) => (
                      <div
                        className="col-md-6"
                        key={person._id || person.id}
                      >
                        <div className="border rounded-3 p-3 bg-white h-100">
                          <div className="d-flex gap-3 align-items-center">
                            <div
                              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                              style={{
                                width: "48px",
                                height: "48px",
                                flexShrink: 0,
                              }}
                            >
                              <i className="bi bi-person-fill fs-4" />
                            </div>

                            <div>
                              <h6 className="fw-bold mb-1">
                                {person.name}
                              </h6>
                              <small className="text-muted">
                                {person.role || person.specialization}
                              </small>
                              {person.experience && (
                                <div className="small text-muted">
                                  {person.experience} Experience
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">
                    Professional details will be available soon.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 sticky-top"
              style={{ top: "100px" }}
            >
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Book This Service</h4>

                <h2 className="text-primary fw-bold">
                  {money(service.price)}
                </h2>

                <p className="text-muted small">
                  Appointment duration: {service.duration || 30} minutes
                </p>

                <hr />

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Service</span>
                  <strong>{service.name}</strong>
                </div>

                <div className="d-flex justify-content-between mb-4">
                  <span className="text-muted">Category</span>
                  <strong className="text-capitalize">{category}</strong>
                </div>

                <Link
                  to={`/booking?service=${encodeURIComponent(serviceId)}`}
                  className="btn btn-primary btn-lg w-100"
                >
                  <i className="bi bi-calendar-check me-2" />
                  Book Appointment
                </Link>

                <Link
                  to="/services"
                  className="btn btn-outline-secondary w-100 mt-2"
                >
                  Explore More Services
                </Link>

                <p className="small text-muted text-center mt-3 mb-0">
                  <i className="bi bi-shield-check text-success me-1" />
                  Secure appointment booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
