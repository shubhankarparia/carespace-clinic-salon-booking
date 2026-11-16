
import React from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/doctors.css";

const expertCategories = [
  {
    id: 1,
    icon: "bi-person-heart",
    category: "HEALTHCARE",
    title: "Medical Experts",
    description:
      "Get professional healthcare support from experienced medical practitioners focused on your health and well-being.",
    features: ["Personalized care", "Health consultations"],
    color: "blue",
    link: "/clinic",
    button: "Explore Clinic",
  },
  {
    id: 2,
    icon: "bi-scissors",
    category: "BEAUTY & GROOMING",
    title: "Salon Professionals",
    description:
      "Discover skilled beauty and grooming professionals offering personalized treatments and salon experiences.",
    features: ["Beauty treatments", "Professional styling"],
    color: "pink",
    link: "/salon",
    button: "Explore Salon",
  },
  {
    id: 3,
    icon: "bi-heart-pulse",
    category: "PERSONALIZED SERVICE",
    title: "Expert Care",
    description:
      "Enjoy attentive service, personalized recommendations, and a comfortable experience at every appointment.",
    features: ["Customer-focused", "Easy appointments"],
    color: "green",
    link: "/booking",
    button: "Book Appointment",
  },
];

function Doctors() {
  return (
    <main className="doctors-page">

      {/* Hero Section */}
      <section className="doctors-hero">
        <div className="container">
          <div className="doctors-hero-content">
            <span className="doctors-eyebrow">
              <i className="bi bi-patch-check-fill"></i>
              MEET OUR PROFESSIONAL TEAM
            </span>

            <h1>
              Experts who care.
              <span> Service you can trust.</span>
            </h1>

            <p>
              Meet the professionals behind our healthcare and salon
              services. We are committed to providing personalized
              attention and a better experience for everyone.
            </p>

            <div className="doctors-hero-actions">
              <Link to="/booking" className="doctors-primary-btn">
                Book an Appointment
                <i className="bi bi-arrow-up-right"></i>
              </Link>

              <Link to="/contact" className="doctors-secondary-btn">
                Contact Our Team
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="doctors-trust">
              <div className="trust-item">
                <i className="bi bi-shield-check"></i>
                <span>Professional service</span>
              </div>

              <div className="trust-item">
                <i className="bi bi-calendar-check"></i>
                <span>Easy appointments</span>
              </div>

              <div className="trust-item">
                <i className="bi bi-heart"></i>
                <span>Personalized care</span>
              </div>
            </div>
          </div>
        </div>

        <div className="doctors-hero-decoration decoration-one"></div>
        <div className="doctors-hero-decoration decoration-two"></div>
      </section>

      {/* Expert Categories */}
      <section className="doctors-experts-section">
        <div className="container">

          <div className="doctors-section-heading">
            <div>
              <span className="doctors-section-eyebrow">
                OUR PROFESSIONALS
              </span>

              <h2>Meet our experts.</h2>

              <p>
                Find the right professional for your healthcare,
                beauty, and personal care needs.
              </p>
            </div>

            <Link to="/booking" className="doctors-view-all">
              Book Now <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {expertCategories.map((expert) => (
              <div className="col-lg-4 col-md-6" key={expert.id}>
                <article className={`expert-card expert-${expert.color}`}>

                  <div className="expert-card-top">
                    <div className="expert-icon">
                      <i className={`bi ${expert.icon}`}></i>
                    </div>

                    <span className="expert-number">
                      0{expert.id}
                    </span>
                  </div>

                  <span className="expert-category">
                    {expert.category}
                  </span>

                  <h3>{expert.title}</h3>

                  <p className="expert-description">
                    {expert.description}
                  </p>

                  <div className="expert-features">
                    {expert.features.map((feature) => (
                      <span key={feature}>
                        <i className="bi bi-check-circle-fill"></i>
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link to={expert.link} className="expert-link">
                    {expert.button}
                    <i className="bi bi-arrow-right"></i>
                  </Link>

                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="doctors-cta-section">
        <div className="container">
          <div className="doctors-cta-content">
            <div>
              <span>YOUR WELL-BEING MATTERS</span>
              <h2>Ready to book your next appointment?</h2>
              <p>
                Choose your service and schedule an appointment
                at a time that works for you.
              </p>
            </div>

            <Link to="/booking" className="doctors-cta-btn">
              Book Appointment
              <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Doctors;
