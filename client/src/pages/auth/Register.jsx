
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "./authService";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Convert the full name into the fields expected by the backend.
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      setLoading(true);

      const response = await registerUser({
        firstName,
        lastName,
        email,
        phone,
        password: form.password,
      });

      setSuccess(
        response?.message || "Your account has been created successfully."
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Navigate to login after successful registration.
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { registered: true },
        });
      }, 1200);
    } catch (err) {
      console.error("Registration Error:", err);
      console.error("Backend Response:", err.response?.data);

      const backendMessage = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;

      setError(
        (Array.isArray(validationErrors) && validationErrors.length
          ? validationErrors.join(", ")
          : null) ||
          backendMessage ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-register-container">

        {/* Left brand panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>

            <h1>Join Our Community</h1>

            <p>
              Create your account and enjoy a simpler way
              to manage your clinic and salon appointments.
            </p>

            <div className="auth-feature">
              <i className="bi bi-person-check"></i>
              <span>Personal customer dashboard</span>
            </div>

            <div className="auth-feature">
              <i className="bi bi-calendar2-check"></i>
              <span>Quick appointment scheduling</span>
            </div>

            <div className="auth-feature">
              <i className="bi bi-bell"></i>
              <span>Appointment updates</span>
            </div>

          </div>

          <div className="auth-brand-decoration decoration-one"></div>
          <div className="auth-brand-decoration decoration-two"></div>
        </div>

        {/* Registration form panel */}
        <div className="auth-form-panel">

          <div className="auth-mobile-logo">
            <i className="bi bi-heart-pulse-fill"></i>
            <span>Care & Style</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Fill in your details to register.</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert-success" role="status">
              <i className="bi bi-check-circle"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Full name */}
            <div className="auth-field">
              <label htmlFor="register-name">Full Name</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-person"></i>

                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  maxLength={101}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="register-email">Email Address</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-envelope"></i>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label htmlFor="register-phone">Phone Number</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-telephone"></i>

                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="register-password">Password</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-lock"></i>

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-shield-lock"></i>

                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label="Toggle confirm password visibility"
                >
                  <i
                    className={`bi ${
                      showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

          </form>

          <div className="auth-bottom-text">
            Already have an account?
            <Link to="/login"> Sign In</Link>
          </div>

          <div className="auth-security-note">
            <i className="bi bi-shield-lock"></i>
            Your information is protected.
          </div>

        </div>
      </div>
    </div>
  );
}
