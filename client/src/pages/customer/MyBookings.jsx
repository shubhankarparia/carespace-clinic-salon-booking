
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyBookings,
  cancelBooking,
} from "./customerApi";

import "./customer.css";

/* =========================================================
   DATE AND TIME HELPERS
========================================================= */

// Format date-only values without accidentally changing the day.
const formatDate = (value) => {
  if (!value) return "—";

  const dateString = String(value);

  // Handles YYYY-MM-DD
  const dateOnlyMatch = dateString.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Handles DD/MM/YYYY
  const indianDateMatch = dateString.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (indianDateMatch) {
    const [, day, month, year] = indianDateMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format the time when the booking was received.
const formatReceivedTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Format the date when the booking was received.
const formatReceivedDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/* =========================================================
   CUSTOMER BOOKINGS PAGE
========================================================= */

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  /* =====================================================
     LOAD BOOKINGS
  ===================================================== */

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyBookings();

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your bookings. Please log in and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CANCEL BOOKING
  ===================================================== */

  const handleCancel = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    try {
      setCancellingId(id);

      await cancelBooking(id);

      await loadBookings();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to cancel this appointment."
      );
    } finally {
      setCancellingId(null);
    }
  };

  /* =====================================================
     FILTER AND SEARCH BOOKINGS
  ===================================================== */

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(
        booking.status || "pending"
      ).toLowerCase();

      const matchesStatus =
        filter === "all" || status === filter;

      const serviceName =
        booking.service?.name ||
        booking.serviceName ||
        "";

      const customerName =
        booking.customerName ||
        booking.customer?.name ||
        booking.user?.name ||
        booking.name ||
        "";

      const customerPhone =
        booking.phone ||
        booking.customer?.phone ||
        booking.user?.phone ||
        "";

      const staffName =
        booking.staff?.name ||
        booking.professional?.name ||
        booking.staffName ||
        booking.professionalName ||
        "";

      const reference =
        booking.bookingId ||
        booking._id ||
        "";

      const query = search.trim().toLowerCase();

      const searchableText = [
        serviceName,
        customerName,
        customerPhone,
        staffName,
        reference,
        booking.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filter, search]);

  /* =====================================================
     BOOKING STATISTICS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: bookings.length,

      pending: bookings.filter(
        (booking) =>
          String(booking.status).toLowerCase() === "pending"
      ).length,

      confirmed: bookings.filter(
        (booking) =>
          String(booking.status).toLowerCase() === "confirmed"
      ).length,

      completed: bookings.filter(
        (booking) =>
          String(booking.status).toLowerCase() === "completed"
      ).length,
    };
  }, [bookings]);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="customer-page">

      {/* PAGE HEADING */}

      <div className="customer-page-heading">
        <div>
          <span className="customer-eyebrow">
            CUSTOMER DASHBOARD
          </span>

          <h1>My Appointments</h1>

          <p>
            Manage and track all your appointments in one place.
          </p>
        </div>

        <Link
          to="/booking"
          className="btn customer-primary-btn"
        >
          <i className="bi bi-plus-lg me-2"></i>
          New Booking
        </Link>
      </div>

      {/* STATISTICS */}

      <div className="customer-stats-grid">

        <div className="customer-stat-card">
          <div className="customer-stat-icon blue">
            <i className="bi bi-calendar2-week"></i>
          </div>

          <div>
            <small>Total Bookings</small>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon orange">
            <i className="bi bi-hourglass-split"></i>
          </div>

          <div>
            <small>Pending</small>
            <h3>{stats.pending}</h3>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon green">
            <i className="bi bi-check-circle"></i>
          </div>

          <div>
            <small>Confirmed</small>
            <h3>{stats.confirmed}</h3>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon purple">
            <i className="bi bi-clipboard-check"></i>
          </div>

          <div>
            <small>Completed</small>
            <h3>{stats.completed}</h3>
          </div>
        </div>

      </div>

      {/* BOOKING HISTORY */}

      <div className="customer-content-card">

        {/* TOOLBAR */}

        <div className="customer-bookings-toolbar">

          <div>
            <h3>Booking History</h3>
            <p>View your appointment records.</p>
          </div>

          <div className="customer-search">
            <i className="bi bi-search"></i>

            <input
              type="search"
              placeholder="Search name, phone, staff or booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </div>

        {/* FILTER TABS */}

        <div className="customer-filter-tabs">
          {[
            "all",
            "pending",
            "confirmed",
            "completed",
            "cancelled",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="customer-loading">
            <div className="spinner-border text-primary"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning">
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="customer-empty-state">
            <i className="bi bi-calendar-x"></i>

            <h4>No Appointments Found</h4>

            <p>
              Try another filter or create a new booking.
            </p>

            <Link
              to="/booking"
              className="btn customer-primary-btn"
            >
              Book Appointment
            </Link>
          </div>
        ) : (

          /* BOOKING TABLE */

          <div className="customer-table-wrapper">
            <table className="table customer-table align-middle">

              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Staff Name</th>
                  <th>Service</th>
                  <th>Booking Received</th>
                  <th>Appointment Date</th>
                  <th>Appointment Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => {
                  const id = booking._id || booking.id;

                  const status = String(
                    booking.status || "pending"
                  ).toLowerCase();

                  const customerName =
                    booking.customerName ||
                    booking.customer?.name ||
                    booking.user?.name ||
                    booking.name ||
                    "Customer";

                  const customerPhone =
                    booking.phone ||
                    booking.customer?.phone ||
                    booking.user?.phone ||
                    "";

                  const staffName =
                    booking.staff?.name ||
                    booking.professional?.name ||
                    booking.staffName ||
                    booking.professionalName ||
                    "Not assigned";

                  const serviceName =
                    booking.service?.name ||
                    booking.serviceName ||
                    "Appointment";

                  const receivedAt = booking.createdAt;

                  const appointmentDate =
                    booking.appointmentDate ||
                    booking.date;

                  const appointmentTime =
                    booking.startTime ||
                    booking.time ||
                    "—";

                  const amount = Number(
                    booking.service?.price ??
                    booking.price ??
                    booking.totalAmount ??
                    0
                  );

                  return (
                    <tr key={id || booking.bookingId}>

                      {/* BOOKING ID */}

                      <td>
                        <strong>
                          {booking.bookingId || id || "—"}
                        </strong>
                      </td>

                      {/* CUSTOMER NAME AND PHONE */}

                      <td>
                        <div className="fw-semibold">
                          {customerName}
                        </div>

                        {customerPhone && (
                          <small className="text-muted">
                            <i className="bi bi-telephone me-1"></i>
                            {customerPhone}
                          </small>
                        )}
                      </td>

                      {/* STAFF NAME */}

                      <td>
                        {staffName}
                      </td>

                      {/* SERVICE */}

                      <td>
                        {serviceName}
                      </td>

                      {/* BOOKING RECEIVED DATE AND TIME */}

                      <td>
                        <div className="fw-semibold">
                          {formatReceivedDate(receivedAt)}
                        </div>

                        <small className="text-muted">
                          {formatReceivedTime(receivedAt)}
                        </small>
                      </td>

                      {/* APPOINTMENT DATE */}

                      <td>
                        {formatDate(appointmentDate)}
                      </td>

                      {/* APPOINTMENT TIME */}

                      <td>
                        {appointmentTime}
                      </td>

                      {/* AMOUNT */}

                      <td>
                        ₹{amount.toLocaleString("en-IN")}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span className={`booking-status ${status}`}>
                          {status.charAt(0).toUpperCase() +
                            status.slice(1)}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="d-flex gap-2">

                          {/* VIEW DETAILS */}

                          {id ? (
                            <Link
                              to={`/my-bookings/${id}`}
                              className="btn btn-sm btn-outline-primary"
                              title="View booking details"
                              aria-label="View booking details"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Booking ID unavailable"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          )}

                          {/* CANCEL BOOKING */}

                          {["pending", "confirmed"].includes(status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={cancellingId === id}
                              onClick={() => handleCancel(id)}
                              title="Cancel booking"
                            >
                              {cancellingId === id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="bi bi-x-lg"></i>
                              )}
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}
