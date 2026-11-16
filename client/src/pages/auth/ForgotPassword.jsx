
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "./authService";
import "./auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(
        email.trim().toLowerCase()
      );

      setSuccess(
        response.message ||
        "If an account exists for this email, password reset instructions will be sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container auth-small-container">

        <div className="auth-form-panel auth-full-panel">

          <Link to="/login" className="auth-back-link">
            <i className="bi bi-arrow-left"></i>
            Back to Login
          </Link>

          <div className="auth-centered-icon">
            <i className="bi bi-key"></i>
          </div>

          <div className="auth-form-heading auth-text-center">
            <span className="auth-eyebrow">ACCOUNT RECOVERY</span>
            <h2>Forgot your password?</h2>

            <p>
              Enter your registered email address.
              If your account exists, we'll send password reset instructions.
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert-success">
              <i className="bi bi-check-circle"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="auth-field">
              <label htmlFor="forgot-email">Email Address</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-envelope"></i>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending request...
                </>
              ) : (
                <>
                  Send Reset Instructions
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

          </form>

          <div className="auth-bottom-text">
            Remember your password?
            <Link to="/login"> Sign In</Link>
          </div>

        </div>

      </div>

    </div>
  );
}
