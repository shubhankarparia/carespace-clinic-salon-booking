
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./common.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token && user);

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenu();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <header className="common-navbar">

      <div className="container">

        <div className="common-navbar-inner">

          {/* Logo */}
          <Link to="/" className="common-navbar-brand" onClick={closeMenu}>
            <span className="common-navbar-logo">
              <i className="bi bi-heart-pulse-fill" />
            </span>

            <span className="common-navbar-brand-text">
              <strong>Care & Style</strong>
              <small>YOUR HEALTH, YOUR STYLE</small>
            </span>
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            className="common-navbar-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} />
          </button>

          {/* Navigation */}
          <nav className={`common-navbar-menu ${menuOpen ? "show" : ""}`}>

            <div className="common-navbar-links">

              <NavLink to="/" end onClick={closeMenu}>
                Home
              </NavLink>

              <NavLink to="/clinic" onClick={closeMenu}>
                Clinic
              </NavLink>

              <NavLink to="/salon" onClick={closeMenu}>
                Salon
              </NavLink>

              <NavLink to="/services" onClick={closeMenu}>
                Services
              </NavLink>

              <NavLink to="/about" onClick={closeMenu}>
                About
              </NavLink>

              <NavLink to="/contact" onClick={closeMenu}>
                Contact
              </NavLink>

            </div>

            <div className="common-navbar-actions">

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="common-navbar-login"
                    onClick={closeMenu}
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="common-navbar-register"
                    onClick={closeMenu}
                  >
                    Get Started
                    <i className="bi bi-arrow-right" />
                  </Link>
                </>
              ) : (
                <div className="common-navbar-account">

                  <button
                    type="button"
                    className="common-navbar-account-btn"
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-expanded={profileOpen}
                  >
                    <span className="common-navbar-avatar">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </span>

                    <span className="common-navbar-account-name">
                      {user?.name || "My Account"}
                    </span>

                    <i className="bi bi-chevron-down" />
                  </button>

                  {profileOpen && (
                    <div className="common-navbar-dropdown">

                      <Link to="/profile" onClick={closeMenu}>
                        <i className="bi bi-person" />
                        My Profile
                      </Link>

                      <Link to="/my-bookings" onClick={closeMenu}>
                        <i className="bi bi-calendar-check" />
                        My Bookings
                      </Link>

                      {user?.role === "admin" && (
                        <Link to="/admin/dashboard" onClick={closeMenu}>
                          <i className="bi bi-speedometer2" />
                          Admin Dashboard
                        </Link>
                      )}

                      <button type="button" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right" />
                        Logout
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

          </nav>

        </div>

      </div>

    </header>
  );
}
