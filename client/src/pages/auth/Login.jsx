
import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, isAuthenticated, loading: authLoading } =
    useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Authenticate through AuthContext.
      // AuthContext handles JWT storage and user state.
      const user = await login({
        email,
        password,
      });

      if (!user) {
        throw new Error("Unable to retrieve your account details.");
      }

      setSuccess("Login successful! Redirecting...");

      // Determine the correct destination.
      const requestedPath = location.state?.from?.pathname;

      let destination;

      if (user.role === "admin") {
        destination = "/admin/dashboard";
      } else {
        destination = requestedPath || "/my-bookings";
      }

      // Remember me is currently a UI preference.
      // Authentication persistence is controlled by AuthContext.
      navigate(destination, {
        replace: true,
      });
    } catch (err) {
      console.error("Login Error:", err);
      console.error("Backend Response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // Wait until the initial authentication check completes.
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>
          <p className="mt-3">Checking your account...</p>
        </div>
      </div>
    );
  }

  // Already authenticated users should not see the login page.
  if (isAuthenticated) {
    return (
      <LoginRedirect
        user={location.state?.from?.pathname}
        role={null}
      />
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Left brand panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-content">

            <div className="auth-brand-logo">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>

            <h1>Care & Style</h1>

            <p>
              Your health, beauty and personal care —
              all in one convenient place.
            </p>

            <div className="auth-feature">
              <i className="bi bi-calendar-check"></i>
              <span>Easy appointment booking</span>
            </div>

            <div className="auth-feature">
              <i className="bi bi-shield-check"></i>
              <span>Secure customer account</span>
            </div>

            <div className="auth-feature">
              <i className="bi bi-clock-history"></i>
              <span>Manage appointments anytime</span>
            </div>

          </div>

          <div className="auth-brand-decoration decoration-one"></div>
          <div className="auth-brand-decoration decoration-two"></div>
        </div>

        {/* Right login panel */}
        <div className="auth-form-panel">

          <div className="auth-mobile-logo">
            <i className="bi bi-heart-pulse-fill"></i>
            <span>Care & Style</span>
          </div>

          <div className="auth-form-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to continue.</p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="auth-alert auth-alert-error"
              role="alert"
            >
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div
              className="auth-alert auth-alert-success"
              role="status"
            >
              <i className="bi bi-check-circle"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">
                Email Address
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-envelope"></i>

                <input
                  id="login-email"
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

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-input-wrapper">
                <i className="bi bi-lock"></i>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <i
                    className={`bi ${
                      showPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="auth-form-options">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password">
                Forgot password?
              </Link>
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>

          </form>

          {/* Register link */}
          <div className="auth-bottom-text">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </div>

          {/* Security note */}
          <div className="auth-security-note">
            <i className="bi bi-shield-lock"></i>
            Your information is protected.
          </div>

        </div>
      </div>
    </div>
  );
}

// Keep redirect logic in a separate component.
function LoginRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  React.useEffect(() => {
    if (!user) return;

    const requestedPath = location.state?.from?.pathname;

    const destination =
      user.role === "admin"
        ? "/admin/dashboard"
        : requestedPath || "/my-bookings";

    navigate(destination, { replace: true });
  }, [user, location.state, navigate]);

  return (
    <div className="auth-page">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Redirecting to your account...</p>
      </div>
    </div>
  );
}
