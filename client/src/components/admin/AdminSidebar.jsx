
import React from "react";
import { NavLink } from "react-router-dom";

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
    title: "Contact Messages",
    path: "/admin/contact-messages",
    icon: "bi-envelope",
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

function AdminSidebar({ collapsed = false, onClose }) {
  // Logout handler
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout from the Admin Panel?"
    );

    if (!confirmed) {
      return;
    }

    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <aside
      className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
    >
      {/* Sidebar Brand */}
      <div className="admin-sidebar-brand">
        <div className="admin-brand-icon">
          <i className="bi bi-heart-pulse-fill"></i>
        </div>

        {!collapsed && (
          <div>
            <h5>Clinic & Salon</h5>
            <small>Admin Panel</small>
          </div>
        )}
      </div>

      {/* Sidebar Navigation */}
      <nav className="admin-sidebar-nav">
        {!collapsed && (
          <small className="admin-menu-label">
            MAIN MENU
          </small>
        )}

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            title={collapsed ? item.title : ""}
            className={({ isActive }) =>
              `admin-sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <i className={`bi ${item.icon}`}></i>

            {!collapsed && (
              <span>{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Bottom */}
      <div className="admin-sidebar-bottom">
        <button
          type="button"
          className="admin-sidebar-link logout-link"
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
        >
          <i className="bi bi-box-arrow-right"></i>

          {!collapsed && (
            <span>Logout</span>
          )}
        </button>
      </div>
      {/* Contact Message Badge Styling */}
      <style>{`
          .contact-message-count {
            margin-left: auto;
            min-width: 23px;
            height: 23px;
            padding: 0 7px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            background: #e5484d;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            line-height: 1;
            flex-shrink: 0;
          }
        `}</style>
    </aside>
  );
}

export default AdminSidebar;
