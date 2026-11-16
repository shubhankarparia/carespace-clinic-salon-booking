
import React, { Component, Suspense } from "react";
import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

// ==========================================
// GLOBAL ERROR BOUNDARY
// ==========================================

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error);
    console.error("Component Details:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-page">
          <div className="app-error-card">
            <div className="app-error-icon">
              <i className="bi bi-exclamation-triangle-fill" />
            </div>

            <h2>Something went wrong!</h2>

            <p>
              We encountered an unexpected error.
              Please reload the application and try again.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={this.handleReload}
            >
              <i className="bi bi-arrow-clockwise me-2" />
              Reload Application
            </button>

            {import.meta.env.DEV && this.state.error && (
              <pre className="app-error-details">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==========================================
// GLOBAL PAGE LOADER
// ==========================================

function AppLoader() {
  return (
    <div className="app-loader">
      <div className="app-loader-content">
        <div className="app-loader-logo">
          <i className="bi bi-heart-pulse-fill" />
        </div>

        <h4>Clinic & Salon</h4>

        <p>Appointment Booking System</p>

        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Loading"
        />

        <span className="app-loader-text">
          Loading your experience...
        </span>
      </div>
    </div>
  );
}

// ==========================================
// ROUTE CHANGE HANDLER
// ==========================================

function RouteHandler() {
  const location = useLocation();

  React.useEffect(() => {
    // Scroll to the top after navigation.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [location.pathname]);

  return null;
}

// ==========================================
// MAIN APPLICATION
// ==========================================

function App() {
  return (
    <AppErrorBoundary>
      <div className="app">

        {/* Navigation scroll handler */}
        <RouteHandler />

        {/* Application routes */}
        <Suspense fallback={<AppLoader />}>
          <AppRoutes />
        </Suspense>

      </div>
    </AppErrorBoundary>
  );
}

export default App;
