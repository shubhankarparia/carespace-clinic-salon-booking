
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div
          className="spinner-border text-primary"
          role="status"
          aria-label="Checking administrator access"
        />
        <p className="text-muted mt-3">
          Verifying administrator access...
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export default AdminRoute;
