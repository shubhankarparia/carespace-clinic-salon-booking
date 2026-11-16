
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { services } from "../../data/demoData.js";
import { money } from "../../utils/format.js";
import "../../assets/styles/clinic.css";

const clinicFeatures = [
  {
    icon: "bi-heart-pulse",
    title: "Patient-focused care",
    description: "A comfortable experience with care centered around your needs.",
  },
  {
    icon: "bi-calendar2-check",
    title: "Easy appointments",
    description: "Find a suitable service and request an appointment online.",
  },
  {
    icon: "bi-shield-check",
    title: "Trusted experience",
    description: "Discover available healthcare services in one convenient place.",
  },
];

const careSteps = [
  {
    number: "01",
    icon: "bi-search",
    title: "Explore services",
    description: "Browse the clinic services and choose the care you need.",
  },
  {
    number: "02",
    icon: "bi-calendar-plus",
    title: "Choose a time",
    description: "Select an available appointment date and time.",
  },
  {
    number: "03",
    icon: "bi-clipboard2-check",
    title: "Confirm booking",
    description: "Submit your details and review your appointment.",
  },
];

export default function Clinic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const clinicServices = useMemo(
    () => services.filter((service) => service.category === "clinic"),
    []
  );

  const categories = useMemo(() => {
    const values = clinicServices
      .map((service) => service.subcategory || service.specialty)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [clinicServices]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return clinicServices.filter((service) => {
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query);

      const serviceCategory = service.subcategory || service.specialty;
      const matchesCategory =
        selectedCategory === "All" || serviceCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [clinicServices, searchTerm, selectedCategory]);

  return (
    <main className="clinic-page">
      {/* Premium hero section */}
      <section className="clinic-hero">
        <div className="clinic-hero-pattern" />

        <div className="container clinic-hero-container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="clinic-hero-content">
                <span className="clinic-eyebrow">
                  <span className="clinic-eyebrow-dot" />
                  YOUR WELLNESS, OUR PRIORITY
                </span>

                <h1>
                  Better health
                  <br />
                  begins with
                  <span> better care.</span>
                </h1>

                <p className="clinic-hero-description">
                  Take a positive step towards your wellbeing. Explore
                  healthcare services, find the care you need, and request
                  your clinic appointment with ease.
                </p>

                <div className="clinic-hero-actions">
                  <Link to="/booking" className="clinic-primary-btn">
                    Book an appointment
                    <i className="bi bi-arrow-up-right" />
                  </Link>

                  <a href="#clinic-services" className="clinic-secondary-btn">
                    Explore services
                    <i className="bi bi-arrow-down" />
                  </a>
                </div>

                <div className="clinic-hero-trust">
                  <div className="clinic-trust-icon">
                    <i className="bi bi-heart-pulse-fill" />
                  </div>
                  <div>
                    <strong>Care that puts you first</strong>
                    <span>Convenient healthcare appointment booking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="clinic-hero-visual">
                <div className="clinic-visual-glow" />

                <div className="clinic-medical-art">
                  <div className="clinic-art-circle clinic-art-circle-one" />
                  <div className="clinic-art-circle clinic-art-circle-two" />

                  <div className="clinic-cross-mark">
                    <i className="bi bi-plus-lg" />
                  </div>

                  <div className="clinic-main-illustration">
                    <i className="bi bi-heart-pulse-fill" />
                  </div>

                  <div className="clinic-pulse-line">
                    <svg viewBox="0 0 340 80" fill="none">
                      <path
                        d="M2 42H88L111 42L129 14L153 68L176 28L192 42H338"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="clinic-floating-card clinic-floating-top">
                  <div className="clinic-floating-icon">
                    <i className="bi bi-calendar-check" />
                  </div>
                  <div>
                    <strong>Easy booking</strong>
                    <span>Choose your appointment</span>
                  </div>
                </div>

                <div className="clinic-floating-card clinic-floating-bottom">
                  <div className="clinic-floating-icon clinic-floating-icon-green">
                    <i className="bi bi-shield-check" />
                  </div>
                  <div>
                    <strong>Care made simple</strong>
                    <span>Your health matters</span>
                  </div>
                </div>

                <div className="clinic-visual-caption">
                  <i className="bi bi-heart-fill" />
                  Your health. Your priority.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and benefits */}
      <section className="clinic-benefits">
        <div className="container">
          <div className="row g-4">
            {clinicFeatures.map((feature) => (
              <div className="col-md-4" key={feature.title}>
                <div className="clinic-benefit-item">
                  <div className="clinic-benefit-icon">
                    <i className={`bi ${feature.icon}`} />
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic services */}
      <section className="clinic-services-section" id="clinic-services">
        <div className="container">
          <div className="clinic-section-heading">
            <div>
              <span className="clinic-section-eyebrow">OUR CLINIC SERVICES</span>
              <h2>
                Healthcare for
                <span> every step.</span>
              </h2>
              <p>
                Explore our available clinic services and find the right
                appointment for your needs.
              </p>
            </div>

            <div className="clinic-service-count">
              <strong>{clinicServices.length.toString().padStart(2, "0")}</strong>
              <span>Available services</span>
            </div>
          </div>

          {/* Search and filters */}
          <div className="clinic-service-toolbar">
            <div className="clinic-search">
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Search clinic services..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search clinic services"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>

            {categories.length > 1 && (
              <div className="clinic-category-filters">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={
                      selectedCategory === category ? "active" : ""
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service cards */}
          {filteredServices.length > 0 ? (
            <div className="row g-4 clinic-service-grid">
              {filteredServices.map((service, index) => (
                <div className="col-md-6 col-xl-4" key={service.id}>
                  <article className="clinic-service-card">
                    <div className="clinic-service-card-top">
                      <div className="clinic-service-icon">
                        <i className={`bi ${service.icon || "bi-heart-pulse"}`} />
                      </div>

                      <span className="clinic-service-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="clinic-service-card-content">
                      <span className="clinic-service-label">
                        {service.subcategory || service.specialty || "Clinic care"}
                      </span>

                      <h3>{service.name}</h3>

                      <p>
                        {service.description ||
                          "Explore this healthcare service and request an appointment."}
                      </p>
                    </div>

                    <div className="clinic-service-card-footer">
                      <div className="clinic-service-price">
                        <span>Starting from</span>
                        <strong>{money(service.price)}</strong>
                      </div>

                      <Link
                        to={`/services/${service.id}`}
                        className="clinic-service-link"
                        aria-label={`View details for ${service.name}`}
                      >
                        <i className="bi bi-arrow-up-right" />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="clinic-empty-state">
              <div>
                <i className="bi bi-search" />
              </div>
              <h3>No services found</h3>
              <p>
                We couldn't find a clinic service matching your search.
                Try another keyword or clear the filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Clear filters
                <i className="bi bi-arrow-counterclockwise ms-2" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Appointment process */}
      <section className="clinic-process-section">
        <div className="container">
          <div className="clinic-section-heading clinic-process-heading">
            <div>
              <span className="clinic-section-eyebrow">SIMPLE & CONVENIENT</span>
              <h2>
                Your appointment,
                <span> made easy.</span>
              </h2>
              <p>
                Booking your clinic visit is simple. Follow these three steps.
              </p>
            </div>
          </div>

          <div className="row g-4 clinic-process-grid">
            {careSteps.map((step) => (
              <div className="col-md-4" key={step.number}>
                <div className="clinic-process-card">
                  <div className="clinic-process-top">
                    <div className="clinic-process-icon">
                      <i className={`bi ${step.icon}`} />
                    </div>
                    <span>{step.number}</span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="clinic-cta-section">
        <div className="container">
          <div className="clinic-cta-card">
            <div className="clinic-cta-decoration clinic-cta-decoration-one" />
            <div className="clinic-cta-decoration clinic-cta-decoration-two" />

            <div className="clinic-cta-content">
              <span>
                <i className="bi bi-heart-pulse-fill" />
                TAKE THE NEXT STEP
              </span>

              <h2>
                Make your health
                <br />
                a priority today.
              </h2>

              <p>
                Find a clinic service and request your appointment in just
                a few simple steps.
              </p>

              <Link to="/booking" className="clinic-cta-button">
                Book your appointment
                <i className="bi bi-arrow-up-right" />
              </Link>
            </div>

            <div className="clinic-cta-icon">
              <i className="bi bi-heart-pulse-fill" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
