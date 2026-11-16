import React from "react";
import { Link, useParams } from "react-router-dom";
import { services, staff } from "../../data/demoData.js";
import { money } from "../../utils/format.js";
import "../../assets/styles/service-details.css";

export default function ServiceDetails() {
  const { id } = useParams();

  const service = services.find((item) => String(item.id) === String(id));

  if (!service) {
    return (
      <section className="service-not-found">
        <div className="container">
          <div className="not-found-card">
            <div className="not-found-icon">
              <i className="bi bi-search" />
            </div>
            <span className="service-eyebrow">SERVICE NOT FOUND</span>
            <h1>We couldn't find this service.</h1>
            <p>
              The service may have been removed or the link may be incorrect.
              Explore our available clinic and salon services instead.
            </p>
            <Link to="/services" className="service-primary-btn">
              Explore all services <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const professionals = staff.filter(
    (person) => person.category === service.category
  );

  const relatedServices = services
    .filter(
      (item) =>
        item.id !== service.id && item.category === service.category
    )
    .slice(0, 3);

  const categoryName =
    service.category?.charAt(0).toUpperCase() +
    service.category?.slice(1);

  const serviceFeatures = [
    {
      icon: "bi-person-check",
      title: "Professional care",
      description: "Choose from professionals listed for this service.",
    },
    {
      icon: "bi-calendar2-check",
      title: "Easy scheduling",
      description: "Select a convenient date and available appointment slot.",
    },
    {
      icon: "bi-heart-pulse",
      title: "Comfort-focused experience",
      description: "A simple appointment experience from start to finish.",
    },
  ];

  return (
    <main className="service-details-page">
      {/* Breadcrumb */}
      <div className="service-breadcrumb-wrap">
        <div className="container">
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <i className="bi bi-chevron-right" />
            <Link to="/services">Services</Link>
            <i className="bi bi-chevron-right" />
            <span>{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero section */}
      <section className="service-details-hero">
        <div className="container">
          <div className="service-details-hero-grid">
            <div className="service-details-intro">
              <Link to="/services" className="service-back-link">
                <i className="bi bi-arrow-left" />
                Back to all services
              </Link>

              <div className="service-category-label">
                <span className="service-category-dot" />
                {categoryName || "Our"} service
              </div>

              <h1>{service.name}</h1>

              <p className="service-details-lead">
                {service.description ||
                  "Discover a comfortable, convenient service experience with CareSpace. Choose your preferred appointment time and get started."}
              </p>

              <div className="service-hero-actions">
                <Link
                  to={`/booking/${service.id}`}
                  className="service-primary-btn"
                >
                  Book an appointment
                  <i className="bi bi-arrow-up-right" />
                </Link>

                <a href="#service-information" className="service-secondary-btn">
                  Explore details
                  <i className="bi bi-arrow-down" />
                </a>
              </div>

              <div className="service-trust-note">
                <i className="bi bi-shield-check" />
                <span>Appointment requests are subject to availability.</span>
              </div>
            </div>

            <div className="service-hero-visual">
              <div className="service-visual-orbit service-orbit-one" />
              <div className="service-visual-orbit service-orbit-two" />

              <div className="service-visual-main">
                <div className="service-visual-top">
                  <span>CARESPACE</span>
                  <i className="bi bi-stars" />
                </div>

                <div className="service-visual-icon">
                  <i className={`bi ${service.icon || "bi-heart-pulse"}`} />
                </div>

                <div className="service-visual-bottom">
                  <span>YOUR WELLNESS, OUR PRIORITY</span>
                  <strong>{service.name}</strong>
                </div>
              </div>

              <div className="service-floating-card service-floating-price">
                <span className="floating-card-icon">
                  <i className="bi bi-wallet2" />
                </span>
                <span>
                  <small>Starting from</small>
                  <strong>{money(service.price)}</strong>
                </span>
              </div>

              <div className="service-floating-card service-floating-duration">
                <span className="floating-card-icon">
                  <i className="bi bi-clock" />
                </span>
                <span>
                  <small>Appointment time</small>
                  <strong>{service.duration || "Flexible"}{service.duration ? " min" : ""}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main information */}
      <section
        className="service-information-section"
        id="service-information"
      >
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <div className="service-section-heading">
                <span className="service-eyebrow">SERVICE OVERVIEW</span>
                <h2>Everything you need to know</h2>
                <p>
                  Get familiar with the service before choosing your
                  appointment.
                </p>
              </div>

              <div className="service-facts-grid">
                <div className="service-fact-card">
                  <div className="service-fact-icon">
                    <i className="bi bi-clock-history" />
                  </div>
                  <div>
                    <small>Estimated duration</small>
                    <strong>
                      {service.duration
                        ? `${service.duration} minutes`
                        : "To be confirmed"}
                    </strong>
                  </div>
                </div>

                <div className="service-fact-card">
                  <div className="service-fact-icon">
                    <i className="bi bi-currency-rupee" />
                  </div>
                  <div>
                    <small>Service price</small>
                    <strong>
                      {service.price != null
                        ? money(service.price)
                        : "Price on request"}
                    </strong>
                  </div>
                </div>

                <div className="service-fact-card">
                  <div className="service-fact-icon">
                    <i className="bi bi-grid" />
                  </div>
                  <div>
                    <small>Service category</small>
                    <strong>{categoryName || "General"}</strong>
                  </div>
                </div>
              </div>

              <div className="service-description-card">
                <div className="service-description-icon">
                  <i className={`bi ${service.icon || "bi-stars"}`} />
                </div>
                <div>
                  <h3>About this service</h3>
                  <p>
                    {service.description ||
                      `Explore ${service.name} at CareSpace. Choose an appointment time that works for you and review the available professionals before booking.`}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="service-benefits-section">
                <div className="service-section-heading">
                  <span className="service-eyebrow">THE CARESPACE EXPERIENCE</span>
                  <h2>Designed around your convenience</h2>
                </div>

                <div className="service-benefits-grid">
                  {serviceFeatures.map((feature) => (
                    <div className="service-benefit-card" key={feature.title}>
                      <div className="service-benefit-icon">
                        <i className={`bi ${feature.icon}`} />
                      </div>
                      <h4>{feature.title}</h4>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professionals */}
              <div className="service-professionals-section">
                <div className="service-section-heading service-heading-row">
                  <div>
                    <span className="service-eyebrow">OUR TEAM</span>
                    <h2>Available professionals</h2>
                    <p>
                      Professionals listed under this service category.
                    </p>
                  </div>
                  <span className="professional-count">
                    {professionals.length}{" "}
                    {professionals.length === 1 ? "professional" : "professionals"}
                  </span>
                </div>

                {professionals.length > 0 ? (
                  <div className="service-professionals-grid">
                    {professionals.map((person) => (
                      <div className="service-professional-card" key={person.id}>
                        <div className="professional-avatar">
                          {person.initials || (
                            <i className="bi bi-person-fill" />
                          )}
                        </div>

                        <div className="professional-information">
                          <h4>{person.name}</h4>
                          <p>{person.role || "Service professional"}</p>
                          <span>
                            <i className="bi bi-check-circle-fill" />
                            Listed professional
                          </span>
                        </div>

                        <div className="professional-card-arrow">
                          <i className="bi bi-arrow-up-right" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="professionals-empty-state">
                    <i className="bi bi-people" />
                    <div>
                      <h4>Professional details coming soon</h4>
                      <p>
                        You can continue to the booking page to check the
                        available appointment options.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking sidebar */}
            <div className="col-lg-4">
              <aside className="service-booking-sidebar">
                <div className="service-booking-card">
                  <div className="booking-card-top">
                    <span className="service-eyebrow">READY WHEN YOU ARE</span>
                    <div className="booking-card-icon">
                      <i className="bi bi-calendar2-heart" />
                    </div>
                    <h3>Make time for yourself.</h3>
                    <p>
                      Your next appointment is just a few steps away. Choose
                      your preferred professional and time.
                    </p>
                  </div>

                  <div className="booking-price-area">
                    <span>Service price</span>
                    <strong>
                      {service.price != null
                        ? money(service.price)
                        : "Price on request"}
                    </strong>
                    <small>
                      <i className="bi bi-info-circle" />
                      Final details can be confirmed during booking.
                    </small>
                  </div>

                  <div className="booking-summary-list">
                    <div>
                      <i className="bi bi-clock" />
                      <span>Duration</span>
                      <strong>
                        {service.duration
                          ? `${service.duration} min`
                          : "To be confirmed"}
                      </strong>
                    </div>
                    <div>
                      <i className="bi bi-people" />
                      <span>Professionals</span>
                      <strong>{professionals.length} available</strong>
                    </div>
                    <div>
                      <i className="bi bi-tag" />
                      <span>Category</span>
                      <strong>{categoryName || "General"}</strong>
                    </div>
                  </div>

                  <Link
                    to={`/booking/${service.id}`}
                    className="service-primary-btn booking-submit-btn"
                  >
                    Book this service
                    <i className="bi bi-arrow-right" />
                  </Link>

                  <div className="booking-secure-note">
                    <i className="bi bi-shield-check" />
                    <span>
                      Your appointment request will be handled securely.
                    </span>
                  </div>
                </div>

                <div className="service-help-card">
                  <div className="service-help-icon">
                    <i className="bi bi-chat-dots" />
                  </div>
                  <div>
                    <h4>Need help choosing?</h4>
                    <p>
                      Visit our contact page if you have questions about this
                      service.
                    </p>
                    <Link to="/contact">
                      Contact us <i className="bi bi-arrow-up-right" />
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {relatedServices.length > 0 && (
        <section className="related-services-section">
          <div className="container">
            <div className="related-services-heading">
              <div>
                <span className="service-eyebrow">EXPLORE MORE</span>
                <h2>Related services</h2>
                <p>You may also be interested in these services.</p>
              </div>
              <Link to="/services" className="related-view-all">
                View all services <i className="bi bi-arrow-right" />
              </Link>
            </div>

            <div className="row g-4">
              {relatedServices.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.id}>
                  <article className="related-service-card">
                    <div className="related-service-icon">
                      <i className={`bi ${item.icon || "bi-stars"}`} />
                    </div>

                    <span className="related-service-category">
                      {item.category}
                    </span>

                    <h3>{item.name}</h3>
                    <p>
                      {item.description ||
                        "Explore this service and choose a convenient appointment."}
                    </p>

                    <div className="related-service-footer">
                      <strong>
                        {item.price != null
                          ? money(item.price)
                          : "Price on request"}
                      </strong>
                      <Link
                        to={`/services/${item.id}`}
                        aria-label={`View ${item.name}`}
                      >
                        <i className="bi bi-arrow-up-right" />
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="service-details-cta-section">
        <div className="container">
          <div className="service-details-cta">
            <div>
              <span className="service-eyebrow">YOUR NEXT STEP</span>
              <h2>Ready to book your {service.name} appointment?</h2>
              <p>
                Choose a date and time that fits your schedule.
              </p>
            </div>
            <Link
              to={`/booking/${service.id}`}
              className="service-cta-button"
            >
              Get started <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}