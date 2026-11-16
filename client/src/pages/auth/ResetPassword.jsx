
import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import { resetPassword } from "./authService";
import "./auth.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(
        token,
        form.password
      );

      setSuccess(
        response.message ||
        "Your password has been reset successfully."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Password reset failed. Your token may have expired."
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
            <i className="bi bi-shield-lock"></i>
          </div>

          <div className="auth-form-heading auth-text-center">
            <span className="auth-eyebrow">SECURE YOUR ACCOUNT</span>
            <h2>Reset Password</h2>

            <p>
              Create a new password for your account.
              Use at least 8 characters.
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
              <label htmlFor="new-password">New Password</label>

              <div className="auth-input-wrapper">
                <i className="bi bi-lock"></i>

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-new-password">
                Confirm New Password
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-shield-lock"></i>

                <input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label="Toggle confirm password visibility"
                >
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || Boolean(success)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Updating password...
                </>
              ) : (
                <>
                  Reset Password
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
