import React from "react";

export default function BookingSummary({
  category,
  service,
  staff,
  date,
  time,
  customer
}) {
  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "Not selected";

  return (
    <div className="booking-summary-card">

      <div className="booking-summary-heading">
        <span>
          <i className="bi bi-receipt"></i>
        </span>

        <div>
          <h3>Booking Summary</h3>
          <small>Review your appointment details</small>
        </div>
      </div>

      <div className="booking-summary-category">
        {category === "salon"
          ? "SALON APPOINTMENT"
          : "CLINIC APPOINTMENT"}
      </div>

      <div className="booking-summary-line">
        <span>Service</span>
        <strong>{service?.name || "Not selected"}</strong>
      </div>

      <div className="booking-summary-line">
        <span>Professional</span>
        <strong>{staff?.name || "Any available"}</strong>
      </div>

      <div className="booking-summary-line">
        <span>Date</span>
        <strong>{formattedDate}</strong>
      </div>

      <div className="booking-summary-line">
        <span>Time</span>
        <strong>{time || "Not selected"}</strong>
      </div>

      {customer?.name && (
        <div className="booking-summary-line">
          <span>Customer</span>
          <strong>{customer.name}</strong>
        </div>
      )}

      <div className="booking-summary-total">
        <span>Estimated Total</span>

        <strong>
          ₹{Number(service?.price || 0).toLocaleString("en-IN")}
        </strong>
      </div>

      <p className="booking-secure-note">
        <i className="bi bi-shield-check"></i>
        Your information is secure.
      </p>
    </div>
  );
}