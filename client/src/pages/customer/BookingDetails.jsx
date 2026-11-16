
import React, { useCallback, useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  getBookingById,
  cancelBooking
} from "./customerApi";

import "./customer.css";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // ==========================================
  // LOAD BOOKING
  // ==========================================

  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBookingById(id);

      const bookingData = data?.booking || data;

      if (!bookingData || !bookingData._id) {
        throw new Error("Booking information was not found.");
      }

      setBooking(bookingData);

    } catch (err) {
      console.error("Booking details error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load booking details."
      );

      setBooking(null);

    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id, loadBooking]);

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const handleCancel = async () => {
    if (cancelling) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError("");

      await cancelBooking(id);

      await loadBooking();

      window.alert(
        "Appointment cancellation request processed successfully."
      );

    } catch (err) {
      console.error("Booking cancellation error:", err);

      window.alert(
        err.response?.data?.message ||
        "Unable to cancel appointment. Please try again."
      );

    } finally {
      setCancelling(false);
    }
  };

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDate = (value) => {
    if (!value) return "Not specified";

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
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="customer-loading">

        <div className="spinner-border text-primary"></div>

        <p>Loading booking details...</p>

      </div>
    );
  }

  // ==========================================
  // ERROR SCREEN
  // ==========================================

  if (error || !booking) {
    return (
      <div className="customer-empty-page">

        <i className="bi bi-exclamation-circle"></i>

        <h2>Booking not found</h2>

        <p>
          {error || "This booking may no longer exist."}
        </p>

        <Link
          to="/my-bookings"
          className="btn customer-primary-btn"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to My Bookings
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

  const staffName =
    booking.staff?.name ||
    booking.staff?.fullName ||
    booking.staffName ||
    "Not assigned";

  const status = String(
    booking.status || "pending"
  ).toLowerCase();

  const formattedStatus = status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const canCancel = [
    "pending",
    "confirmed"
  ].includes(status);

  const date =
    booking.appointmentDate ||
    booking.date;

  const customerName =
    booking.customerName ||
    booking.user?.name ||
    booking.user?.firstName ||
    "—";

  const customerPhone =
    booking.customerPhone ||
    booking.phone ||
    booking.user?.phone ||
    "—";

  const customerEmail =
    booking.customerEmail ||
    booking.email ||
    booking.user?.email ||
    "—";

  const amount = Number(
    booking.totalAmount ??
    booking.price ??
    booking.service?.price ??
    0
  );

  const duration =
    booking.duration ||
    booking.service?.duration;

  const bookingReference =
    booking.bookingId ||
    booking._id ||
    id;

  // ==========================================
  // STATUS DESCRIPTION
  // ==========================================

  const statusDescription = {
    pending: "Your appointment is awaiting confirmation.",
    confirmed: "Your appointment has been confirmed.",
    cancelled: "This appointment has been cancelled.",
    rejected: "Your appointment request was rejected.",
    completed: "This appointment is completed."
  };

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="customer-page">

      {/* ==================================
          PAGE HEADER
      ================================== */}

      <div className="customer-page-heading">

        <div>

          <span className="customer-eyebrow">
            APPOINTMENT INFORMATION
          </span>

          <h1>Booking Details</h1>

          <p>
            Review your appointment information.
          </p>

        </div>

        <Link
          to="/my-bookings"
          className="btn btn-outline-secondary"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </Link>

      </div>

      {/* ==================================
          BOOKING DETAILS LAYOUT
      ================================== */}

      <div className="booking-details-layout">

        <main className="customer-content-card">

          {/* BOOKING HEADER */}

          <div className="booking-details-header">

            <div className="booking-details-icon">
              <i className="bi bi-calendar-check"></i>
            </div>

            <div>

              <h3>{serviceName}</h3>

              <small>
                Reference: {bookingReference}
              </small>

            </div>

            <span
              className={`booking-status ms-auto ${status}`}
            >
              {formattedStatus}
            </span>

          </div>

          <hr />

          {/* APPOINTMENT INFORMATION */}

          <h4 className="customer-card-title">
            Appointment Information
          </h4>

          <div className="customer-info-grid">

            {/* SERVICE */}

            <div className="customer-info-item">

              <span>Service</span>

              <strong>{serviceName}</strong>

            </div>

            {/* CATEGORY */}

            <div className="customer-info-item">

              <span>Category</span>

              <strong>
                {booking.category
                  ? booking.category.charAt(0).toUpperCase() +
                    booking.category.slice(1)
                  : "Clinic"}
              </strong>

            </div>

            {/* PROFESSIONAL */}

            <div className="customer-info-item">

              <span>Professional</span>

              <strong>{staffName}</strong>

            </div>

            {/* DATE */}

            <div className="customer-info-item">

              <span>Appointment Date</span>

              <strong>{formatDate(date)}</strong>

            </div>

            {/* START TIME */}

            <div className="customer-info-item">

              <span>Start Time</span>

              <strong>
                {booking.startTime || booking.time || "—"}
              </strong>

            </div>

            {/* END TIME */}

            <div className="customer-info-item">

              <span>End Time</span>

              <strong>{booking.endTime || "—"}</strong>

            </div>

            {/* DURATION */}

            {duration && (
              <div className="customer-info-item">

                <span>Duration</span>

                <strong>{duration} minutes</strong>

              </div>
            )}

            {/* CUSTOMER */}

            <div className="customer-info-item">

              <span>Customer</span>

              <strong>{customerName}</strong>

            </div>

            {/* PHONE */}

            <div className="customer-info-item">

              <span>Phone</span>

              <strong>{customerPhone}</strong>

            </div>

            {/* EMAIL */}

            <div className="customer-info-item">

              <span>Email</span>

              <strong>{customerEmail}</strong>

            </div>

            {/* AMOUNT */}

            <div className="customer-info-item">

              <span>Total Amount</span>

              <strong>
                ₹{amount.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

          {/* ADDITIONAL NOTES */}

          {booking.notes && (
            <div className="customer-notes">

              <strong>
                <i className="bi bi-chat-left-text me-2"></i>
                Additional Notes
              </strong>

              <p>{booking.notes}</p>

            </div>
          )}

          {/* ==================================
              ACTION BUTTONS
          ================================== */}

          <div className="booking-details-actions">

            {canCancel && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleCancel}
                disabled={cancelling}
              >

                {cancelling ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel Appointment
                  </>
                )}

              </button>
            )}

            <button
              type="button"
              className="btn customer-primary-btn"
              onClick={() => navigate("/my-bookings")}
            >
              <i className="bi bi-calendar-check me-2"></i>
              My Bookings
            </button>

          </div>

        </main>

        {/* ==================================
            BOOKING STATUS SIDEBAR
        ================================== */}

        <aside className="customer-content-card booking-status-card">

          <div className="booking-side-icon mb-3">
            <i className="bi bi-info-circle"></i>
          </div>

          <h4>Booking Status</h4>

          <span className={`booking-status ${status}`}>
            {formattedStatus}
          </span>

          <p className="mt-3">
            {statusDescription[status] ||
              "Please contact support for more information about your appointment."}
          </p>

          <hr />

          <div className="customer-info-item">

            <span>Booking Reference</span>

            <strong>{bookingReference}</strong>

          </div>

          <div className="customer-info-item mt-3">

            <span>Appointment Date</span>

            <strong>{formatDate(date)}</strong>

          </div>

        </aside>

      </div>

    </div>
  );
}
