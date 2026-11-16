
import React from "react";
import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Authentication protection
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminRoute from "../components/auth/AdminRoute";

// Public pages
import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Services from "../pages/public/Services";
import ServiceDetails from "../pages/public/ServiceDetails";
import Clinic from "../pages/public/Clinic";
import Salon from "../pages/public/Salon";
import Doctors from "../pages/public/Doctors";
import Contact from "../pages/public/Contact";
import NotFound from "../pages/public/NotFound";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Customer pages
import Booking from "../pages/customer/Booking";
import BookingConfirmation from "../pages/customer/BookingConfirmation";
import MyBookings from "../pages/customer/MyBookings";
import CustomerBookingDetails from "../pages/customer/BookingDetails";
import Profile from "../pages/customer/Profile";

// Admin pages
import Dashboard from "../pages/admin/Dashboard";
import ManageBookings from "../pages/admin/ManageBookings";
import AdminBookingDetails from "../pages/admin/BookingDetails";
import ManageServices from "../pages/admin/ManageServices";
import AddService from "../pages/admin/AddService";
import EditService from "../pages/admin/EditService";
import ManageStaff from "../pages/admin/ManageStaff";
import AddStaff from "../pages/admin/AddStaff";
import EditStaff from "../pages/admin/EditStaff";
import ManageCustomers from "../pages/admin/ManageCustomers";
import ManageSchedule from "../pages/admin/ManageSchedule";
import ManageHolidays from "../pages/admin/ManageHolidays";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";
import ManageContactMessages from "../pages/admin/ManageContactMessages";

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================
          PUBLIC WEBSITE ROUTES
      ===================================== */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/clinic" element={<Clinic />} />

        <Route path="/salon" element={<Salon />} />

        <Route path="/services" element={<Services />} />

        <Route
          path="/services/:id"
          element={<ServiceDetails />}
        />

        <Route path="/doctors" element={<Doctors />} />

        <Route path="/contact" element={<Contact />} />

        {/* =====================================
            CUSTOMER PROTECTED ROUTES
        ===================================== */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/booking"
            element={<Booking />}
          />

          <Route
            path="/booking/:serviceId"
            element={<Booking />}
          />

          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />

          <Route
            path="/my-bookings"
            element={<MyBookings />}
          />

          <Route
            path="/my-bookings/:id"
            element={<CustomerBookingDetails />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>
      </Route>

      {/* =====================================
          AUTHENTICATION ROUTES
      ===================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* =====================================
          ADMIN PROTECTED ROUTES
      ===================================== */}

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* Dashboard */}
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Booking Management */}
          <Route
            path="bookings"
            element={<ManageBookings />}
          />

          <Route
            path="bookings/:id"
            element={<AdminBookingDetails />}
          />

          {/* Service Management */}
          <Route
            path="services"
            element={<ManageServices />}
          />

          <Route
            path="services/add"
            element={<AddService />}
          />

          <Route
            path="services/edit/:id"
            element={<EditService />}
          />

          {/* Staff Management */}
          <Route
            path="staff"
            element={<ManageStaff />}
          />

          <Route
            path="staff/add"
            element={<AddStaff />}
          />

          <Route
            path="staff/edit/:id"
            element={<EditStaff />}
          />

          {/* Customer Management */}
          <Route
            path="customers"
            element={<ManageCustomers />}
          />
          {/* Contact Messages Management */}
          <Route
            path="contact-messages"
            element={<ManageContactMessages />}
          />

          {/* Schedule Management */}
          <Route
            path="schedule"
            element={<ManageSchedule />}
          />

          <Route
            path="holidays"
            element={<ManageHolidays />}
          />

          {/* Reports and Settings */}
          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* =====================================
          FALLBACK ROUTES
      ===================================== */}

      <Route
        path="/404"
        element={<NotFound />}
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;
