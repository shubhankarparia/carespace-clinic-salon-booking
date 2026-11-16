
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./customer.css";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  const [copied, setCopied] = useState(false);

  // ==========================================
  // NO BOOKING FOUND
  // ==========================================

  if (!booking) {
    return (
      <div className="customer-empty-page">

        <div className="customer-empty-icon">
          <i className="bi bi-calendar-x"></i>
        </div>

        <h2>No booking information found</h2>

        <p>
          Please create an appointment before viewing its confirmation.
        </p>

        <Link
          to="/booking"
          className="btn customer-primary-btn"
        >
          <i className="bi bi-calendar-plus me-2"></i>
          Book Appointment
        </Link>

      </div>
    );
  }

  // ==========================================
  // BOOKING INFORMATION
  // ==========================================

  const serviceName =
    booking.service?.name ||
    booking.serviceName ||
    "Appointment";

  const professionalName =
    booking.staff?.name ||
    booking.staff?.fullName ||
    booking.staffName ||
    "Assigned Professional";

  const bookingDate =
    booking.appointmentDate ||
    booking.date ||
    "";

  const bookingTime =
    booking.startTime ||
    booking.time ||
    "";

  const bookingEndTime =
    booking.endTime || "";

  const bookingId =
    booking.bookingId ||
    booking._id ||
    booking.id ||
    "Pending";

  const customerName =
    booking.customerName ||
    booking.user?.name ||
    booking.user?.firstName ||
    "Customer";

  const bookingStatus =
    booking.status || "pending";

  const formattedStatus = bookingStatus
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const amount = Number(
    booking.totalAmount ??
    booking.price ??
    booking.service?.price ??
    0
  );

  const duration =
    booking.duration ||
    booking.service?.duration ||
    null;

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDate = (value) => {
    if (!value) return "Not specified";

    // Avoid UTC timezone shifting for YYYY-MM-DD dates.
    const dateString = String(value).slice(0, 10);

    const parts = dateString.split("-");

    if (parts.length === 3) {
      const [year, month, day] = parts;

      if (
        /^\d{4}$/.test(year) &&
        /^\d{2}$/.test(month) &&
        /^\d{2}$/.test(day)
      ) {
        return `${day}/${month}/${year}`;
      }
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  // ==========================================
  // COPY BOOKING REFERENCE
  // ==========================================

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(String(bookingId));

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (error) {
      console.error("Unable to copy booking reference:", error);
    }
  };

  // ==========================================
  // CONFIRMATION PAGE
  // ==========================================

  return (
    <div className="customer-page">

      <div className="confirmation-card">

        {/* SUCCESS ICON */}

        <div className="confirmation-success-icon">
          <i className="bi bi-check-lg"></i>
        </div>

        {/* HEADING */}

        <span className="customer-eyebrow">
          APPOINTMENT CONFIRMATION
        </span>

        <h1>Booking Successful!</h1>

        <p className="confirmation-description">
          Your appointment request has been submitted successfully.
          Keep your booking reference for future use.
        </p>

        {/* ==================================
            BOOKING REFERENCE
        ================================== */}

        <div className="confirmation-reference">

          <small>YOUR BOOKING REFERENCE</small>

          <h3>{bookingId}</h3>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={copyReference}
          >

            {copied ? (
              <>
                <i className="bi bi-check2 me-1"></i>
                Copied!
              </>
            ) : (
              <>
                <i className="bi bi-copy me-1"></i>
                Copy Reference
              </>
            )}

          </button>

        </div>

        {/* ==================================
            APPOINTMENT DETAILS
        ================================== */}

        <div className="confirmation-details">

          <h4>Appointment Details</h4>

          {/* SERVICE */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-grid me-2"></i>
              Service
            </span>

            <strong>{serviceName}</strong>

          </div>

          {/* CATEGORY */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-tag me-2"></i>
              Category
            </span>

            <strong>
              {booking.category
                ? booking.category.charAt(0).toUpperCase() +
                  booking.category.slice(1)
                : "Not specified"}
            </strong>

          </div>

          {/* PROFESSIONAL */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-person-badge me-2"></i>
              Professional
            </span>

            <strong>{professionalName}</strong>

          </div>

          {/* DATE */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-calendar3 me-2"></i>
              Date
            </span>

            <strong>{formatDate(bookingDate)}</strong>

          </div>

          {/* TIME */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-clock me-2"></i>
              Time
            </span>

            <strong>
              {bookingTime
                ? `${bookingTime}${bookingEndTime ? ` - ${bookingEndTime}` : ""}`
                : "Not specified"}
            </strong>

          </div>

          {/* DURATION */}

          {duration && (
            <div className="confirmation-row">

              <span>
                <i className="bi bi-hourglass-split me-2"></i>
                Duration
              </span>

              <strong>{duration} minutes</strong>

            </div>
          )}

          {/* CUSTOMER */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-person me-2"></i>
              Customer
            </span>

            <strong>{customerName}</strong>

          </div>

          {/* STATUS */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-info-circle me-2"></i>
              Status
            </span>

            <span
              className={`booking-status ${bookingStatus}`}
            >
              {formattedStatus}
            </span>

          </div>

          {/* AMOUNT */}

          <div className="confirmation-row">

            <span>
              <i className="bi bi-currency-rupee me-2"></i>
              Total Amount
            </span>

            <strong>
              ₹{amount.toLocaleString("en-IN")}
            </strong>

          </div>

        </div>

        {/* ==================================
            INFORMATION NOTE
        ================================== */}

        <div className="confirmation-note">

          <i className="bi bi-info-circle"></i>

          <p>
            Your booking status may remain pending until the clinic
            or salon confirms your appointment. You can check the
            latest status in My Bookings.
          </p>

        </div>

        {/* ==================================
            ACTION BUTTONS
        ================================== */}

        <div className="confirmation-actions">

          <button
            type="button"
            className="btn customer-primary-btn"
            onClick={() => navigate("/my-bookings")}
          >
            <i className="bi bi-calendar-check me-2"></i>
            View My Bookings
          </button>

          <Link
            to="/booking"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Book Another Appointment
          </Link>

        </div>

      </div>

    </div>
  );
}
