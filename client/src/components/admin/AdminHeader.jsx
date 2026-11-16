
import React from "react";
import { Link } from "react-router-dom";

function AdminHeader({
  onMenuClick,
  onCollapseClick,
  sidebarCollapsed = false,
}) {
  return (
    <header className="admin-header">
      {/* Left section */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="admin-header-icon mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <i className="bi bi-list"></i>
        </button>

        <button
          type="button"
          className="admin-header-icon desktop-collapse-btn"
          onClick={onCollapseClick}
          aria-label="Collapse sidebar"
        >
          <i
            className={`bi ${
              sidebarCollapsed
                ? "bi-layout-sidebar-inset"
                : "bi-layout-sidebar"
            }`}
          ></i>
        </button>

        <div>
          <h5 className="mb-0 fw-bold">Admin Dashboard</h5>
          <small className="text-muted">
            Manage your business
          </small>
        </div>
      </div>

      {/* Right section */}
      <div className="d-flex align-items-center gap-3">
        <Link
          to="/"
          className="admin-header-icon"
          title="Visit website"
        >
          <i className="bi bi-house"></i>
        </Link>

        <div className="admin-header-profile">
          <div className="admin-profile-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div className="d-none d-md-block">
            <strong>Administrator</strong>
            <small className="d-block text-muted">
              Admin Account
            </small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
