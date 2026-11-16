
import React from "react";
import { Link } from "react-router-dom";

function AdminHeader({
  onMenuClick,
  onCollapseClick,
  sidebarCollapsed = false,
}) {
  return (
    <header className="admin-header">
      {/* =========================================
          HEADER LEFT SECTION
      ========================================= */}

      <div className="admin-header-left">
        {/* Mobile Menu Button */}

        <button
          type="button"
          className="admin-header-icon mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open admin sidebar"
          title="Open Menu"
        >
          <i className="bi bi-list"></i>
        </button>

        {/* Desktop Sidebar Collapse Button */}

        <button
          type="button"
          className="admin-header-icon desktop-collapse-btn"
          onClick={onCollapseClick}
          aria-label={
            sidebarCollapsed
              ? "Expand admin sidebar"
              : "Collapse admin sidebar"
          }
          title={
            sidebarCollapsed
              ? "Expand Sidebar"
              : "Collapse Sidebar"
          }
        >
          <i
            className={`bi ${
              sidebarCollapsed
                ? "bi-layout-sidebar-inset"
                : "bi-layout-sidebar"
            }`}
          ></i>
        </button>

        {/* Page Title */}

        <div className="admin-header-title">
          <h5>Admin Dashboard</h5>
          <small>Manage your business</small>
        </div>
      </div>

      {/* =========================================
          HEADER RIGHT SECTION
      ========================================= */}

      <div className="admin-header-right">
        {/* Visit Website */}

        <Link
          to="/"
          className="admin-header-icon"
          title="Visit Website"
          aria-label="Visit Website"
        >
          <i className="bi bi-house"></i>
        </Link>

        {/* Notification Placeholder (optional) */}

        <div className="admin-header-profile">
          <div className="admin-profile-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div className="admin-profile-info">
            <strong>Administrator</strong>
            <small>Admin Account</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
