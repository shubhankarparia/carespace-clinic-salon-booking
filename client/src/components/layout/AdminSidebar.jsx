
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// =========================================================
// ADMIN SIDEBAR MENU ITEMS
// =========================================================

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: "bi-speedometer2",
  },
  {
    title: "Bookings",
    path: "/admin/bookings",
    icon: "bi-calendar-check",
  },
  {
    title: "Services",
    path: "/admin/services",
    icon: "bi-grid",
  },
  {
    title: "Staff",
    path: "/admin/staff",
    icon: "bi-people",
  },
  {
    title: "Customers",
    path: "/admin/customers",
    icon: "bi-person",
  },
  {
    title: "Schedule",
    path: "/admin/schedule",
    icon: "bi-calendar-week",
  },
  {
    title: "Holidays",
    path: "/admin/holidays",
    icon: "bi-calendar-x",
  },
  {
    title: "Reports",
    path: "/admin/reports",
    icon: "bi-bar-chart",
  },
  {
    title: "Settings",
    path: "/admin/settings",
    icon: "bi-gear",
  },
];

// =========================================================
// ADMIN SIDEBAR COMPONENT
// =========================================================

function AdminSidebar({ collapsed = false, onClose }) {
  const location = useLocation();

  // Close sidebar safely
  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  // Close sidebar after navigation
  const handleNavigation = () => {
    handleClose();
  };

  // Check active menu
  const isMenuActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // =======================================================
  // ADMIN LOGOUT
  // =======================================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout from the Admin Panel?"
    );

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // =======================================================
  // COMPONENT UI
  // =======================================================

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      aria-label="Admin sidebar navigation"
    >
      {/* ================================================
          SIDEBAR BRAND
      ================================================= */}

      <div className="admin-sidebar-brand">

        <NavLink
          to="/admin/dashboard"
          className="admin-brand-link"
          onClick={handleNavigation}
          title="Clinic & Salon Admin"
        >
          <div className="admin-brand-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>

          {!collapsed && (
            <div className="admin-brand-text">
              <strong>Clinic & Salon</strong>
              <span>ADMIN PANEL</span>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={handleClose}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <i className="bi bi-x-lg"></i>
        </button>

      </div>

      {/* ================================================
          SIDEBAR NAVIGATION
      ================================================= */}

      <nav className="admin-sidebar-navigation">

        {!collapsed && (
          <div className="admin-menu-group">
            <div className="admin-menu-heading">
              MAIN MENU
            </div>
          </div>
        )}

        {/* Navigation items */}

        {menuItems.map((item) => {
          const active = isMenuActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              title={collapsed ? item.title : undefined}
              aria-current={active ? "page" : undefined}
              className={({ isActive }) =>
                `admin-nav-link ${
                  isActive || active ? "active" : ""
                }`
              }
            >
              <i
                className={`bi ${item.icon}`}
                aria-hidden="true"
              ></i>

              {!collapsed && (
                <span>{item.title}</span>
              )}
            </NavLink>
          );
        })}

      </nav>

      {/* ================================================
          SIDEBAR BOTTOM
      ================================================= */}

      <div className="admin-sidebar-bottom">

        {/* Logout button */}

        <button
          type="button"
          className="admin-nav-link"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          aria-label="Logout from admin panel"
        >
          <i
            className="bi bi-box-arrow-right"
            aria-hidden="true"
          ></i>

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>

      </div>

    </aside>
  );
}

export default AdminSidebar;
