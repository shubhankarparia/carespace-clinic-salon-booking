
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../admin/AdminSidebar";
import AdminHeader from "../admin/AdminHeader";

import "./layout.css";

function AdminLayout() {
  // Mobile sidebar is closed by default
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop sidebar is expanded by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Open or close mobile sidebar
  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Collapse or expand desktop sidebar
  const handleCollapseClick = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Close mobile sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Close mobile sidebar with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Prevent background scrolling while mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div
      className={`admin-layout ${
        sidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      {/* ADMIN SIDEBAR */}
      <div
        className={`admin-sidebar-wrapper ${
          sidebarOpen ? "mobile-open" : ""
        }`}
      >
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onClose={closeSidebar}
        />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close sidebar"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              closeSidebar();
            }
          }}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="admin-main-wrapper">
        {/* ADMIN HEADER */}
        <AdminHeader
          onMenuClick={handleMenuClick}
          onCollapseClick={handleCollapseClick}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
