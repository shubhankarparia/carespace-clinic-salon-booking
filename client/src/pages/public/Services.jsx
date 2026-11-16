
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { services } from "../../data/demoData.js";
import { money } from "../../utils/format.js";
import "../../assets/styles/services.css";

const categories = [
  {
    value: "all",
    label: "All services",
    icon: "bi-grid",
  },
  {
    value: "clinic",
    label: "Clinic",
    icon: "bi-heart-pulse",
  },
  {
    value: "salon",
    label: "Salon",
    icon: "bi-stars",
  },
];

export default function Services() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recommended");

  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const categoryMatch =
        category === "all" || service.category === category;

      const query = search.trim().toLowerCase();

      const searchMatch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category?.toLowerCase().includes(query) ||
        service.subcategory?.toLowerCase().includes(query) ||
        service.specialty?.toLowerCase().includes(query);

      return categoryMatch && searchMatch;
    });

    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    return result;
  }, [category, search, sortBy]);

  const clinicCount = services.filter(
    (service) => service.category === "clinic"
  ).length;

  const salonCount = services.filter(
    (service) => service.category === "salon"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSortBy("recommended");
  };

  return (
    <main className="services-page">
      {/* =================================
          HERO SECTION
      ================================== */}
      <section className="services-hero">
        <div className="services-hero-pattern" />

        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="services-hero-content">
                <span className="services-eyebrow">
                  <span className="services-eyebrow-dot" />
                  DISCOVER CARESPACE
                </span>

                <h1>
                  Find the care
                  <br />
                  you need.
                  <span> All in one place.</span>
                </h1>

                <p>
                  From healthcare consultations to beauty and personal care,
                  discover services that help you look good and feel your best.
                </p>

                <div className="services-hero-actions">
                  <a href="#all-services" className="services-hero-primary">
                    Explore all services
                    <i className="bi bi-arrow-down" />
                  </a>

                  <Link to="/booking" className="services-hero-secondary">
                    Book an appointment
                    <i className="bi bi-arrow-up-right" />
                  </Link>
                </div>

                <div className="services-hero-note">
                  <i className="bi bi-check-circle-fill" />
                  <span>Clinic care and salon services in one platform</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="services-hero-visual">
                <div className="services-visual-circle services-visual-circle-one" />
                <div className="services-visual-circle services-visual-circle-two" />

                <div className="services-visual-main">
                  <div className="services-visual-symbol">
                    <i className="bi bi-flower1" />
                  </div>

                  <span>CARESPACE</span>
                  <h2>Care for every you.</h2>
                  <p>Health meets beauty.</p>

                  <div className="services-visual-divider">
                    <span />
                    <i className="bi bi-heart-fill" />
                    <span />
                  </div>
                </div>

                <div className="services-floating-card services-floating-card-top">
                  <div className="services-floating-icon">
                    <i className="bi bi-heart-pulse" />
                  </div>
                  <div>
                    <strong>Clinic</strong>
                    <span>Healthcare services</span>
                  </div>
                </div>

                <div className="services-floating-card services-floating-card-bottom">
                  <div className="services-floating-icon services-salon-icon">
                    <i className="bi bi-stars" />
                  </div>
                  <div>
                    <strong>Salon</strong>
                    <span>Beauty & personal care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          CATEGORY OVERVIEW
      ================================== */}
      <section className="services-overview">
        <div className="container">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="services-overview-card">
                <div className="services-overview-icon">
                  <i className="bi bi-grid-fill" />
                </div>
                <div>
                  <strong>{services.length.toString().padStart(2, "0")}</strong>
                  <span>Total services</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="services-overview-card">
                <div className="services-overview-icon clinic-overview-icon">
                  <i className="bi bi-heart-pulse-fill" />
                </div>
                <div>
                  <strong>{clinicCount.toString().padStart(2, "0")}</strong>
                  <span>Clinic services</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="services-overview-card">
                <div className="services-overview-icon salon-overview-icon">
                  <i className="bi bi-stars" />
                </div>
                <div>
                  <strong>{salonCount.toString().padStart(2, "0")}</strong>
                  <span>Salon services</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          SERVICE DISCOVERY
      ================================== */}
      <section className="services-catalog-section" id="all-services">
        <div className="container">
          <div className="services-section-heading">
            <div>
              <span className="services-section-eyebrow">
                EXPLORE OUR COLLECTION
              </span>

              <h2>
                Services designed
                <span> around you.</span>
              </h2>

              <p>
                Browse available services, compare prices and choose what
                works best for you.
              </p>
            </div>

            <div className="services-result-count">
              <strong>{filteredServices.length}</strong>
              <span>
                {filteredServices.length === 1 ? "Service found" : "Services found"}
              </span>
            </div>
          </div>

          {/* Search, category filters and sorting */}
          <div className="services-filter-panel">
            <div className="services-filter-top">
              <div className="services-search-box">
                <i className="bi bi-search" />

                <input
                  type="search"
                  placeholder="Search by service name or category..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search services"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>

              <div className="services-sort-box">
                <label htmlFor="services-sort">
                  <i className="bi bi-sort-down" />
                  Sort by
                </label>

                <select
                  id="services-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            <div className="services-filter-bottom">
              <div className="services-category-tabs">
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    className={category === item.value ? "active" : ""}
                    onClick={() => setCategory(item.value)}
                  >
                    <i className={`bi ${item.icon}`} />
                    {item.label}

                    <span>
                      {item.value === "all"
                        ? services.length
                        : item.value === "clinic"
                          ? clinicCount
                          : salonCount}
                    </span>
                  </button>
                ))}
              </div>

              {(search || category !== "all" || sortBy !== "recommended") && (
                <button
                  type="button"
                  className="services-clear-filters"
                  onClick={clearFilters}
                >
                  <i className="bi bi-arrow-counterclockwise" />
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Service cards */}
          {filteredServices.length > 0 ? (
            <div className="row g-4 services-grid">
              {filteredServices.map((service, index) => (
                <div className="col-md-6 col-xl-4" key={service.id}>
                  <article className="services-card">
                    <div className="services-card-top">
                      <div
                        className={`services-card-icon ${
                          service.category === "salon"
                            ? "salon-service-icon"
                            : "clinic-service-icon"
                        }`}
                      >
                        <i className={`bi ${service.icon || "bi-grid"}`} />
                      </div>

                      <span className="services-card-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="services-card-body">
                      <div className="services-card-labels">
                        <span
                          className={`services-category-badge ${
                            service.category === "salon"
                              ? "salon-badge"
                              : "clinic-badge"
                          }`}
                        >
                          <i
                            className={`bi ${
                              service.category === "salon"
                                ? "bi-stars"
                                : "bi-heart-pulse"
                            }`}
                          />
                          {service.category || "Service"}
                        </span>

                        {(service.subcategory || service.specialty) && (
                          <span className="services-subcategory">
                            {service.subcategory || service.specialty}
                          </span>
                        )}
                      </div>

                      <h3>{service.name}</h3>

                      <p>
                        {service.description ||
                          "Discover this service and request your appointment with CareSpace."}
                      </p>
                    </div>

                    <div className="services-card-meta">
                      <div>
                        <i className="bi bi-clock" />
                        <span>
                          {service.duration
                            ? `${service.duration} min`
                            : "Duration varies"}
                        </span>
                      </div>

                      <div className="services-card-price">
                        <span>Starting from</span>
                        <strong>{money(service.price)}</strong>
                      </div>
                    </div>

                    <div className="services-card-footer">
                      <Link
                        to={`/services/${service.id}`}
                        className="services-details-link"
                      >
                        View details
                        <i className="bi bi-arrow-right" />
                      </Link>

                      <Link
                        to={`/booking/${service.id}`}
                        className="services-book-button"
                      >
                        Book now
                        <i className="bi bi-arrow-up-right" />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="services-empty-state">
              <div className="services-empty-icon">
                <i className="bi bi-search" />
              </div>

              <h3>No services found</h3>

              <p>
                We couldn't find any services matching your search. Try
                changing your category or search keyword.
              </p>

              <button type="button" onClick={clearFilters}>
                <i className="bi bi-arrow-counterclockwise" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =================================
          BOOKING PROCESS
      ================================== */}
      <section className="services-process-section">
        <div className="container">
          <div className="services-section-heading">
            <div>
              <span className="services-section-eyebrow">
                SIMPLE APPOINTMENT PROCESS
              </span>

              <h2>
                Book in just
                <span> a few steps.</span>
              </h2>

              <p>
                Your next clinic or salon appointment is only a few steps
                away.
              </p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="services-process-card">
                <div className="services-process-icon">
                  <i className="bi bi-search" />
                  <span>01</span>
                </div>
                <h3>Choose a service</h3>
                <p>
                  Explore our clinic and salon services and find the right
                  option for your needs.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="services-process-card">
                <div className="services-process-icon">
                  <i className="bi bi-calendar2-week" />
                  <span>02</span>
                </div>
                <h3>Select your time</h3>
                <p>
                  Choose your preferred professional, appointment date and
                  available time slot.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="services-process-card">
                <div className="services-process-icon">
                  <i className="bi bi-check2-circle" />
                  <span>03</span>
                </div>
                <h3>Confirm your booking</h3>
                <p>
                  Submit your details and review your appointment information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          FINAL CTA
      ================================== */}
      <section className="services-cta-section">
        <div className="container">
          <div className="services-cta-card">
            <div className="services-cta-decoration services-cta-decoration-one" />
            <div className="services-cta-decoration services-cta-decoration-two" />

            <div className="services-cta-content">
              <span>
                <i className="bi bi-heart-fill" />
                YOUR CARE JOURNEY STARTS HERE
              </span>

              <h2>
                Found what
                <br />
                you're looking for?
              </h2>

              <p>
                Take the next step. Choose your service and request an
                appointment with CareSpace.
              </p>

              <Link to="/booking" className="services-cta-button">
                Book an appointment
                <i className="bi bi-arrow-up-right" />
              </Link>
            </div>

            <div className="services-cta-art">
              <i className="bi bi-flower1" />
              <span>CareSpace</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
