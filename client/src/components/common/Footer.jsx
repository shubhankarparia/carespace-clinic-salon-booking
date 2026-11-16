
import React from "react";
import { Link } from "react-router-dom";
import "./common.css";

export default function Footer() {
  return (
    <footer className="common-footer">

      <div className="container">

        <div className="row g-4">

          {/* Company information */}
          <div className="col-lg-4 col-md-6">

            <Link to="/" className="common-footer-brand">
              <span className="common-footer-logo">
                <i className="bi bi-heart-pulse-fill" />
              </span>

              <span>Care & Style</span>
            </Link>

            <p className="common-footer-description">
              Your trusted destination for clinic appointments
              and salon services. Book appointments with
              experienced professionals quickly and easily.
            </p>

            <div className="common-footer-socials">
              <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="bi bi-facebook" />
              </a>

              <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram" />
              </a>

              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <i className="bi bi-linkedin" />
              </a>
            </div>

          </div>

          {/* Quick links */}
          <div className="col-lg-2 col-md-6 col-6">

            <h5 className="common-footer-heading">Quick Links</h5>

            <ul className="common-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">All Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-6 col-6">

            <h5 className="common-footer-heading">Our Services</h5>

            <ul className="common-footer-links">
              <li><Link to="/clinic">Clinic Appointments</Link></li>
              <li><Link to="/salon">Salon Services</Link></li>
              <li><Link to="/doctors">Our Professionals</Link></li>
              <li><Link to="/booking">Book Appointment</Link></li>
            </ul>

          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6">

            <h5 className="common-footer-heading">Contact Us</h5>

            <ul className="common-footer-contact">
              <li>
                <i className="bi bi-geo-alt" />
                <span>Your Business Address, India</span>
              </li>

              <li>
                <i className="bi bi-telephone" />
                <a href="tel:+910000000000">+91 00000 00000</a>
              </li>

              <li>
                <i className="bi bi-envelope" />
                <a href="mailto:info@example.com">info@example.com</a>
              </li>
            </ul>

          </div>

        </div>

        <div className="common-footer-bottom">
          <p>
            © {new Date().getFullYear()} Care & Style.
            All rights reserved.
          </p>

          <div>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>

      </div>

    </footer>
  );
}
