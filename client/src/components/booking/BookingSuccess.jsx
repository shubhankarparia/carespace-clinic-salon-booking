import React from "react";
import { Link } from "react-router-dom";

export default function BookingSuccess({
  booking,
  onNewBooking
}) {
  return (
    <div className="booking-success-wrap">

      <div className="booking-success-icon">
        <i className="bi bi-check-lg"></i>
      </div>

      <span className="booking-eyebrow">
        APPOINTMENT REQUEST RECEIVED
      </span>

      <h2>Your Appointment is Booked!</h2>

      <p>
        Thank you for choosing our service.
        Your appointment details are displayed below.
      </p>

      <div className="booking-success-reference">
        <small>BOOKING REFERENCE</small>

        <strong>
          {booking?.bookingId || booking?._id || "Pending confirmation"}
        </strong>
      </div>

      <div className="booking-success-details">

        <div>
          <span>Service</span>
          <strong>
            {booking?.service?.name || booking?.serviceName || "Appointment"}
          </strong>
        </div>

        <div>
          <span>Date</span>
          <strong>
            {booking?.date || booking?.appointmentDate || "To be confirmed"}
          </strong>
        </div>

        <div>
          <span>Time</span>
          <strong>
            {booking?.time || booking?.startTime || "To be confirmed"}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong className="text-warning">
            {booking?.status || "Pending"}
          </strong>
        </div>

      </div>

      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">

        <Link to="/my-bookings" className="btn booking-primary-btn">
          View My Bookings
        </Link>

        <button
          className="btn btn-outline-secondary"
          onClick={onNewBooking}
        >
          Book Another
        </button>

      </div>
    </div>
  );
}