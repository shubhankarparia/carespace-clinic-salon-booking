
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";

import {
  PageHeader,
  Panel,
  StatusBadge,
  ErrorMessage,
  formatDate,
  getError,
} from "./AdminComponents";

import "./admin-pages.css";

// ==========================================
// FORMAT BOOKING RECEIVED DATE & TIME
// ==========================================

const formatBookingReceived = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  const receivedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const receivedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return `${receivedDate} · ${receivedTime}`;
};

export default function BookingDetails() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD BOOKING DETAILS
  // ==========================================

  const loadBooking = async () => {
    if (!id) {
      setError("Invalid booking ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // GET /api/bookings/:id
      const response = await api.get(`/bookings/${id}`);

      const result =
        response.data?.booking ||
        response.data?.data ||
        response.data;

      setBooking(result);
    } catch (err) {
      setError(
        getError(err, "Unable to load booking details.")
      );

      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  // ==========================================
  // UPDATE BOOKING STATUS
  // ==========================================

  const updateStatus = async (newStatus) => {
    if (!newStatus || saving) return;

    setSaving(true);
    setError("");

    try {
      // PATCH /api/bookings/:id/status
      await api.patch(`/bookings/${id}/status`, {
        status: newStatus,
      });

      await loadBooking();
    } catch (err) {
      setError(
        getError(err, "Unable to update booking.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const cancelBooking = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed || saving) return;

    setSaving(true);
    setError("");

    try {
      // PATCH /api/bookings/:id/cancel
      await api.patch(`/bookings/${id}/cancel`);

      await loadBooking();
    } catch (err) {
      setError(
        getError(err, "Unable to cancel booking.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="admin-page-content">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-muted mt-3">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // BOOKING NOT FOUND
  // ==========================================

  if (!booking) {
    return (
      <div className="admin-page-content">
        <PageHeader
          title="Booking Details"
          subtitle="View appointment information."
          icon="bi-calendar2-check"
        />

        <ErrorMessage
          message={error || "Booking not found."}
          onRetry={loadBooking}
        />

        <Link
          to="/admin/bookings"
          className="btn btn-light mt-3"
        >
          <i className="bi bi-arrow-left me-2" />
          Back to Bookings
        </Link>
      </div>
    );
  }

  // ==========================================
  // BOOKING DATA
  // ==========================================

  const service = booking.service || {};
  const staff = booking.staff || {};
  const customer = booking.customer || {};

  const customerName =
    booking.customerName ||
    [
      customer.firstName,
      customer.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "—";

  const customerEmail =
    booking.customerEmail ||
    customer.email ||
    "—";

  const customerPhone =
    booking.customerPhone ||
    customer.phone ||
    "—";

  const bookingReference =
    booking.bookingNumber ||
    booking.bookingId ||
    booking._id;

  const category =
    booking.category ||
    service.category ||
    "—";

  const totalAmount =
    booking.totalAmount ??
    booking.price ??
    service.price ??
    0;

  const professionalName =
    staff.name ||
    "Not assigned";

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="admin-page-content">

      {/* PAGE HEADER */}

      <PageHeader
        title="Booking Details"
        subtitle={`Appointment reference: ${bookingReference}`}
        icon="bi-calendar2-check"
        action={
          <Link
            to="/admin/bookings"
            className="btn btn-light"
          >
            <i className="bi bi-arrow-left me-2" />
            Back
          </Link>
        }
      />

      {/* ERROR MESSAGE */}

      <ErrorMessage message={error} />

      {/* APPOINTMENT INFORMATION */}

      <Panel
        title="Appointment Information"
        action={
          <StatusBadge status={booking.status} />
        }
      >
        <div className="row g-4">

          {[
            ["Booking ID", bookingReference],

            [
              "Booking Received",
              formatBookingReceived(booking.createdAt),
            ],

            ["Service", service.name || "—"],

            ["Category", category],

            [
              "Total Amount",
              `₹${Number(totalAmount).toLocaleString("en-IN")}`,
            ],

            [
              "Appointment Date",
              formatDate(booking.appointmentDate),
            ],

            ["Start Time", booking.startTime || "—"],

            ["End Time", booking.endTime || "—"],

            ["Professional", professionalName],
          ].map(([label, value]) => (
            <div
              className="col-md-6 col-lg-3"
              key={label}
            >
              <div className="admin-detail-item">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </div>
          ))}

        </div>
      </Panel>

      {/* CUSTOMER AND PROFESSIONAL INFORMATION */}

      <div className="row g-3 mt-1">

        {/* CUSTOMER INFORMATION */}

        <div className="col-lg-6">
          <Panel title="Customer Information">

            <div className="admin-detail-list">

              <p>
                <span>Name</span>
                <strong>{customerName}</strong>
              </p>

              <p>
                <span>Email</span>
                <strong>{customerEmail}</strong>
              </p>

              <p>
                <span>Phone</span>
                <strong>{customerPhone}</strong>
              </p>

            </div>

          </Panel>
        </div>

        {/* PROFESSIONAL INFORMATION */}

        <div className="col-lg-6">
          <Panel title="Professional Information">

            <div className="admin-detail-list">

              <p>
                <span>Name</span>
                <strong>{professionalName}</strong>
              </p>

              <p>
                <span>Email</span>
                <strong>{staff.email || "—"}</strong>
              </p>

              <p>
                <span>Specialization</span>
                <strong>
                  {staff.specialization || "—"}
                </strong>
              </p>

              <p>
                <span>Experience</span>
                <strong>
                  {staff.experience != null
                    ? `${staff.experience} years`
                    : "—"}
                </strong>
              </p>

            </div>

          </Panel>
        </div>

      </div>

      {/* ADDITIONAL INFORMATION */}

      <Panel title="Additional Information">

        <div className="admin-detail-list">

          <p>
            <span>Duration</span>
            <strong>
              {booking.duration
                ? `${booking.duration} minutes`
                : "—"}
            </strong>
          </p>

          <p>
            <span>Payment Status</span>
            <strong>
              {booking.paymentStatus || "Pending"}
            </strong>
          </p>

          <p>
            <span>Payment Method</span>
            <strong>
              {booking.paymentMethod || "—"}
            </strong>
          </p>

          <p>
            <span>Notes</span>
            <strong>
              {booking.notes || "No additional notes"}
            </strong>
          </p>

        </div>

      </Panel>

      {/* MANAGE APPOINTMENT */}

      <Panel title="Manage Appointment">

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              saving ||
              booking.status !== "pending"
            }
            onClick={() => updateStatus("confirmed")}
          >
            <i className="bi bi-check-circle me-2" />
            Confirm Booking
          </button>

          <button
            type="button"
            className="btn btn-success"
            disabled={
              saving ||
              !["confirmed", "pending"].includes(
                booking.status
              )
            }
            onClick={() => updateStatus("completed")}
          >
            <i className="bi bi-check2-all me-2" />
            Mark Completed
          </button>

          <button
            type="button"
            className="btn btn-danger"
            disabled={
              saving ||
              ["cancelled", "completed", "rejected"].includes(
                booking.status
              )
            }
            onClick={cancelBooking}
          >
            <i className="bi bi-x-circle me-2" />
            Cancel Booking
          </button>

        </div>

        {saving && (
          <p className="text-muted mt-3 mb-0">
            <span className="spinner-border spinner-border-sm me-2" />
            Updating appointment...
          </p>
        )}

      </Panel>

    </div>
  );
}
