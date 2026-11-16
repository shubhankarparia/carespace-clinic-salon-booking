
import { Link } from "react-router-dom";
import { services } from "../../data/demoData.js";
import { money } from "../../utils/format.js";
import "../../assets/styles/home.css";

const benefits = [
  {
    icon: "bi-calendar2-check",
    title: "Easy Online Booking",
    description: "Schedule your appointment in just a few clicks.",
  },
  {
    icon: "bi-people",
    title: "Skilled Professionals",
    description: "Find the right experts for your care needs.",
  },
  {
    icon: "bi-heart-pulse",
    title: "Care That Matters",
    description: "Enjoy thoughtful and personalized service.",
  },
];

export default function Home() {
  const popularServices = services.slice(0, 3);

  return (
    <main className="home-page">

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="home-hero-shape home-shape-one"></div>
        <div className="home-hero-shape home-shape-two"></div>

        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <div className="home-hero-content">

                <span className="home-eyebrow">
                  <i className="bi bi-stars"></i>
                  YOUR WELLNESS, OUR PRIORITY
                </span>

                <h1>
                  Feel good.
                  <br />
                  Look good.
                  <br />
                  <span>Live better.</span>
                </h1>

                <p className="home-hero-description">
                  Your health and beauty deserve the best care.
                  Discover trusted clinic and salon services,
                  connect with professionals, and book your
                  appointment with ease.
                </p>

                <div className="home-hero-actions">
                  <Link to="/booking" className="home-btn-primary">
                    Book an appointment
                    <i className="bi bi-arrow-up-right"></i>
                  </Link>

                  <Link to="/services" className="home-btn-outline">
                    Explore services
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>

                <div className="home-hero-stats">
                  <div className="home-stat">
                    <strong>{services.length}+</strong>
                    <span>Services</span>
                  </div>

                  <div className="home-stat-divider"></div>

                  <div className="home-stat">
                    <strong>5+</strong>
                    <span>Professionals</span>
                  </div>

                  <div className="home-stat-divider"></div>

                  <div className="home-stat">
                    <strong>Easy</strong>
                    <span>Online booking</span>
                  </div>
                </div>

              </div>
            </div>

            {/* HERO VISUAL */}
            <div className="col-lg-6">
              <div className="home-hero-visual">

                <div className="home-visual-glow"></div>

                <div className="home-visual-main">
                  <div className="home-visual-top">
                    <span className="home-visual-label">
                      CARESPACE EXPERIENCE
                    </span>
                    <span className="home-visual-sparkle">
                      <i className="bi bi-stars"></i>
                    </span>
                  </div>

                  <div className="home-visual-center">
                    <div className="home-visual-icon">
                      <i className="bi bi-heart-pulse-fill"></i>
                    </div>

                    <span>CARE FOR YOURSELF</span>

                    <h2>
                      Your time.
                      <br />
                      Your wellness.
                    </h2>

                    <p>
                      A better way to care for your health
                      and beauty.
                    </p>
                  </div>

                  <div className="home-visual-bottom">
                    <span>
                      <i className="bi bi-shield-check"></i>
                      Trusted experience
                    </span>
                    <span>
                      <i className="bi bi-calendar-check"></i>
                      Simple booking
                    </span>
                  </div>
                </div>

                <div className="home-floating-card home-floating-booking">
                  <div className="home-floating-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>
                  <div>
                    <strong>Easy appointments</strong>
                    <small>Book in a few clicks</small>
                  </div>
                  <i className="bi bi-check-circle-fill home-floating-check"></i>
                </div>

                <div className="home-floating-card home-floating-care">
                  <div className="home-floating-icon pink">
                    <i className="bi bi-heart-fill"></i>
                  </div>
                  <div>
                    <strong>Personalized care</strong>
                    <small>Made around your needs</small>
                  </div>
                </div>

                <div className="home-visual-decoration">
                  <i className="bi bi-flower1"></i>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="home-benefits-section">
        <div className="container">
          <div className="row g-4">
            {benefits.map((benefit) => (
              <div className="col-md-4" key={benefit.title}>
                <div className="home-benefit-item">
                  <div className="home-benefit-icon">
                    <i className={`bi ${benefit.icon}`}></i>
                  </div>

                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLINIC AND SALON */}
      <section className="home-section home-categories">
        <div className="container">

          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">
                EXPLORE CARESPACE
              </span>
              <h2>One place. Two ways to care.</h2>
              <p>
                Everything you need to feel healthier,
                more confident, and refreshed.
              </p>
            </div>

            <Link to="/services" className="home-text-link">
              Explore all services
              <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>

          <div className="row g-4">

            {/* CLINIC FEATURE */}
            <div className="col-lg-6">
              <article className="home-category-card home-clinic-card">
                <div className="home-category-content">
                  <span className="home-category-tag">
                    <i className="bi bi-heart-pulse"></i>
                    YOUR HEALTH MATTERS
                  </span>

                  <h3>Care for a<br />healthier you.</h3>

                  <p>
                    Connect with healthcare professionals
                    and take a positive step towards better
                    health and well-being.
                  </p>

                  <Link to="/clinic" className="home-category-btn">
                    Explore clinic
                    <i className="bi bi-arrow-up-right"></i>
                  </Link>
                </div>

                <div className="home-category-art clinic-art">
                  <i className="bi bi-heart-pulse-fill"></i>
                  <span className="art-circle art-circle-one"></span>
                  <span className="art-circle art-circle-two"></span>
                </div>

                <span className="home-category-number">01</span>
              </article>
            </div>

            {/* SALON FEATURE */}
            <div className="col-lg-6">
              <article className="home-category-card home-salon-card">
                <div className="home-category-content">
                  <span className="home-category-tag">
                    <i className="bi bi-stars"></i>
                    TIME FOR YOURSELF
                  </span>

                  <h3>Beauty begins<br />with self-care.</h3>

                  <p>
                    Enjoy beauty, grooming, and styling
                    services designed to make you feel
                    refreshed and confident.
                  </p>

                  <Link to="/salon" className="home-category-btn">
                    Explore salon
                    <i className="bi bi-arrow-up-right"></i>
                  </Link>
                </div>

                <div className="home-category-art salon-art">
                  <i className="bi bi-scissors"></i>
                  <span className="art-circle art-circle-one"></span>
                  <span className="art-circle art-circle-two"></span>
                </div>

                <span className="home-category-number">02</span>
              </article>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="home-section home-popular-section">
        <div className="container">

          <div className="home-section-heading">
            <div>
              <span className="home-section-eyebrow">
                HANDPICKED FOR YOU
              </span>
              <h2>Popular services.</h2>
              <p>
                Discover services that help you look
                good and feel your best.
              </p>
            </div>

            <Link to="/services" className="home-text-link">
              View all services
              <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {popularServices.length > 0 ? (
              popularServices.map((service) => (
                <div className="col-lg-4 col-md-6" key={service.id}>
                  <article className="home-service-card">

                    <div className="home-service-top">
                      <div className="home-service-icon">
                        <i className={`bi ${service.icon}`}></i>
                      </div>

                      <span className={`home-service-badge ${
                        service.category === "salon"
                          ? "salon-badge"
                          : "clinic-badge"
                      }`}>
                        {service.category}
                      </span>
                    </div>

                    <h3>{service.name}</h3>

                    <p>{service.description}</p>

                    <div className="home-service-bottom">
                      <div>
                        <small>Starting from</small>
                        <strong>{money(service.price)}</strong>
                      </div>

                      <Link
                        to={`/services/${service.id}`}
                        aria-label={`View ${service.name} details`}
                      >
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>
                    </div>

                  </article>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="home-empty-services">
                  <i className="bi bi-grid"></i>
                  <h3>Services coming soon</h3>
                  <p>Our services will be available here shortly.</p>
                  <Link to="/services" className="home-btn-primary">
                    Explore services
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section home-how-section">
        <div className="container">

          <div className="home-centered-heading">
            <span className="home-section-eyebrow">
              SIMPLE & CONVENIENT
            </span>
            <h2>Your appointment in three steps.</h2>
            <p>
              Getting the care you need has never been easier.
            </p>
          </div>

          <div className="row g-4 home-steps-row">
            <div className="col-md-4">
              <div className="home-step-card">
                <span className="home-step-number">01</span>
                <div className="home-step-icon">
                  <i className="bi bi-grid"></i>
                </div>
                <h3>Choose a service</h3>
                <p>
                  Explore our clinic and salon services
                  and select what you need.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="home-step-card">
                <span className="home-step-number">02</span>
                <div className="home-step-icon">
                  <i className="bi bi-calendar2-week"></i>
                </div>
                <h3>Select date & time</h3>
                <p>
                  Find a suitable appointment slot
                  based on availability.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="home-step-card">
                <span className="home-step-number">03</span>
                <div className="home-step-icon">
                  <i className="bi bi-check2-circle"></i>
                </div>
                <h3>Confirm booking</h3>
                <p>
                  Complete your booking and get ready
                  for your appointment.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-content">

            <div className="home-cta-icon">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>

            <span className="home-section-eyebrow">
              MAKE TIME FOR YOURSELF
            </span>

            <h2>
              Your well-being deserves
              <br />
              a little more attention.
            </h2>

            <p>
              Take the first step towards better care.
              Find your service and book your next appointment today.
            </p>

            <Link to="/booking" className="home-cta-button">
              Book your appointment
              <i className="bi bi-arrow-up-right"></i>
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}
