
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Checking authentication"
        />
        <p className="text-muted mt-3">
          Checking your account...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children || <Outlet />;
}

export default ProtectedRoute;
