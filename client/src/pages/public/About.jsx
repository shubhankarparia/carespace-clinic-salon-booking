
import React from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/about.css";

const values = [
  {
    icon: "bi-heart",
    number: "01",
    title: "Customer first",
    description:
      "We put people at the center of everything, making every interaction simple, thoughtful and helpful.",
  },
  {
    icon: "bi-shield-check",
    number: "02",
    title: "Trust and care",
    description:
      "We aim to create a dependable booking experience where customers can explore services with confidence.",
  },
  {
    icon: "bi-calendar-check",
    number: "03",
    title: "Everyday convenience",
    description:
      "We bring clinic and salon services together so finding and requesting an appointment feels effortless.",
  },
  {
    icon: "bi-stars",
    number: "04",
    title: "Quality experience",
    description:
      "We focus on a clean, accessible and welcoming digital experience at every step of the journey.",
  },
];

const journey = [
  {
    icon: "bi-grid",
    title: "Discover services",
    description:
      "Explore clinic and salon services in one convenient platform.",
  },
  {
    icon: "bi-person-check",
    title: "Choose a professional",
    description:
      "Find the service and professional that suit your requirements.",
  },
  {
    icon: "bi-calendar2-check",
    title: "Request an appointment",
    description:
      "Select a convenient date and time to request your booking.",
  },
];

export default function About() {
  return (
    <main className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero-pattern" />

        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="about-hero-content">
                <span className="about-eyebrow">
                  <span className="about-eyebrow-dot" />
                  GET TO KNOW CARESPACE
                </span>

                <h1>
                  A better way
                  <br />
                  to experience
                  <span> everyday care.</span>
                </h1>

                <p>
                  We bring clinic and salon appointments together in one
                  convenient place, helping you discover services and take
                  care of yourself with greater ease.
                </p>

                <div className="about-hero-actions">
                  <Link to="/services" className="about-primary-btn">
                    Explore our services
                    <i className="bi bi-arrow-up-right" />
                  </Link>

                  <Link to="/contact" className="about-outline-btn">
                    Get in touch
                    <i className="bi bi-arrow-right" />
                  </Link>
                </div>

                <div className="about-hero-note">
                  <i className="bi bi-heart-pulse-fill" />
                  <span>Health meets beauty. Care meets convenience.</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="about-hero-visual">
                <div className="about-visual-backdrop" />

                <div className="about-hero-orbit about-orbit-one" />
                <div className="about-hero-orbit about-orbit-two" />

                <div className="about-brand-art">
                  <div className="about-brand-flower">
                    <i className="bi bi-flower1" />
                  </div>

                  <span className="about-brand-small">WELCOME TO</span>
                  <h2>CareSpace</h2>
                  <span className="about-brand-tagline">
                    HEALTH MEETS BEAUTY
                  </span>

                  <div className="about-brand-divider">
                    <span />
                    <i className="bi bi-heart-fill" />
                    <span />
                  </div>
                </div>

                <div className="about-floating-note about-floating-note-top">
                  <div className="about-floating-icon">
                    <i className="bi bi-heart-pulse" />
                  </div>
                  <div>
                    <strong>Clinic care</strong>
                    <span>Focus on wellbeing</span>
                  </div>
                </div>

                <div className="about-floating-note about-floating-note-bottom">
                  <div className="about-floating-icon about-floating-icon-salon">
                    <i className="bi bi-stars" />
                  </div>
                  <div>
                    <strong>Salon care</strong>
                    <span>Feel your best</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND INTRODUCTION */}
      <section className="about-intro-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="about-intro-visual">
                <div className="about-intro-main-card">
                  <div className="about-intro-icon">
                    <i className="bi bi-flower1" />
                  </div>

                  <span>ONE PLACE. TWO WORLDS.</span>
                  <h2>Care for your health. Care for yourself.</h2>
                  <p>
                    Bringing wellness and personal care closer to your
                    everyday life.
                  </p>
                </div>

                <div className="about-intro-mini-card">
                  <i className="bi bi-calendar-check" />
                  <div>
                    <strong>Simple booking</strong>
                    <span>Convenience starts here</span>
                  </div>
                </div>

                <div className="about-intro-decoration" />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="about-intro-content">
                <span className="about-section-eyebrow">WHO WE ARE</span>

                <h2>
                  Making quality care
                  <span> easier to access.</span>
                </h2>

                <p>
                  CareSpace is a clinic and salon appointment booking platform
                  designed to make everyday care more accessible and
                  convenient.
                </p>

                <p>
                  Whether you are looking for a healthcare consultation or a
                  beauty and personal care treatment, our platform helps you
                  explore available services, choose professionals and
                  request appointments in one place.
                </p>

                <div className="about-intro-points">
                  <div>
                    <i className="bi bi-check-circle-fill" />
                    <span>Clinic and salon services together</span>
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill" />
                    <span>Convenient online appointment requests</span>
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill" />
                    <span>A simple and user-friendly experience</span>
                  </div>
                </div>

                <Link to="/services" className="about-text-link">
                  Discover what we offer
                  <i className="bi bi-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="about-purpose-section">
        <div className="container">
          <div className="about-purpose-heading">
            <span className="about-section-eyebrow">OUR PURPOSE</span>
            <h2>
              What drives
              <span> everything we do.</span>
            </h2>
            <p>
              Our purpose is to make finding and requesting everyday care
              simpler for everyone.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <article className="about-purpose-card about-mission-card">
                <div className="about-purpose-icon">
                  <i className="bi bi-bullseye" />
                </div>

                <span>OUR MISSION</span>

                <h3>Make everyday care more convenient.</h3>

                <p>
                  To simplify the way people discover clinic and salon
                  services by providing a convenient platform for exploring
                  professionals and requesting appointments.
                </p>

                <div className="about-purpose-watermark">
                  <i className="bi bi-bullseye" />
                </div>
              </article>
            </div>

            <div className="col-lg-6">
              <article className="about-purpose-card about-vision-card">
                <div className="about-purpose-icon">
                  <i className="bi bi-eye" />
                </div>

                <span>OUR VISION</span>

                <h3>A simpler experience for better wellbeing.</h3>

                <p>
                  To create a welcoming digital destination where healthcare
                  and personal care services are easier to discover, access
                  and manage.
                </p>

                <div className="about-purpose-watermark">
                  <i className="bi bi-eye" />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="about-values-section">
        <div className="container">
          <div className="about-values-heading">
            <div>
              <span className="about-section-eyebrow">WHAT MATTERS TO US</span>
              <h2>
                Built around
                <span> what matters.</span>
              </h2>
              <p>
                The principles that shape the CareSpace experience.
              </p>
            </div>

            <Link to="/contact" className="about-values-link">
              Connect with us
              <i className="bi bi-arrow-up-right" />
            </Link>
          </div>

          <div className="row g-4">
            {values.map((value) => (
              <div className="col-md-6 col-xl-3" key={value.number}>
                <article className="about-value-card">
                  <div className="about-value-top">
                    <div className="about-value-icon">
                      <i className={`bi ${value.icon}`} />
                    </div>
                    <span>{value.number}</span>
                  </div>

                  <h3>{value.title}</h3>
                  <p>{value.description}</p>

                  <div className="about-value-bottom">
                    <span />
                    CARESPACE VALUES
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="about-journey-section">
        <div className="container">
          <div className="about-purpose-heading">
            <span className="about-section-eyebrow">YOUR CARE JOURNEY</span>
            <h2>
              Three steps.
              <span> One simple experience.</span>
            </h2>
            <p>
              Getting started with CareSpace is designed to be straightforward.
            </p>
          </div>

          <div className="row g-4">
            {journey.map((step, index) => (
              <div className="col-md-4" key={step.title}>
                <article className="about-journey-card">
                  <div className="about-journey-icon">
                    <i className={`bi ${step.icon}`} />
                    <span>0{index + 1}</span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-card">
            <div className="about-cta-circle about-cta-circle-one" />
            <div className="about-cta-circle about-cta-circle-two" />

            <div className="about-cta-content">
              <span>
                <i className="bi bi-flower1" />
                YOUR CARE JOURNEY STARTS HERE
              </span>

              <h2>
                Take a moment
                <br />
                for yourself.
              </h2>

              <p>
                Discover clinic and salon services and make your next
                appointment with CareSpace.
              </p>

              <div className="about-cta-actions">
                <Link to="/booking" className="about-cta-primary">
                  Book an appointment
                  <i className="bi bi-arrow-up-right" />
                </Link>

                <Link to="/services" className="about-cta-secondary">
                  View services
                </Link>
              </div>
            </div>

            <div className="about-cta-art">
              <i className="bi bi-flower1" />
              <span>CareSpace</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
