
import React from "react";
import { BOOKING_STATUS_OPTIONS } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import { formatTime } from "../../utils/timeUtils";

const getId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || value.id : value;
};

const getName = (value, fallback = "—") => {
  if (!value) return fallback;

  return typeof value === "object"
    ? value.name || fallback
    : fallback;
};

// Format booking received date and time
const formatBookingReceived = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),

    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }),
  };
};

function BookingTable({
  bookings = [],
  loading = false,
  onView = () => {},
  onStatusChange = () => {},
  onCancel = () => {},
}) {
  const statusClass = {
    pending: "bg-warning-subtle text-warning-emphasis",
    confirmed: "bg-primary-subtle text-primary",
    completed: "bg-success-subtle text-success",
    cancelled: "bg-danger-subtle text-danger",
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary"></div>

          <p className="text-muted mt-3 mb-0">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-header bg-white border-0 p-3 p-md-4">
        <h5 className="fw-bold mb-1">Appointment Records</h5>

        <small className="text-muted">
          {bookings.length} appointment(s) displayed
        </small>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Professional</th>
              <th>Booking Received</th>
              <th>Appointment Date & Time</th>
              <th>Status</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5">
                  <i className="bi bi-calendar-x fs-1 text-muted"></i>

                  <h6 className="mt-3 fw-semibold">
                    No bookings found
                  </h6>

                  <p className="text-muted small mb-0">
                    Try changing your filters.
                  </p>
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const status = booking.status || "pending";
                const service = booking.serviceId;
                const staff = booking.staffId;

                const bookingId =
                  booking.bookingId ||
                  booking._id?.slice(-8)?.toUpperCase() ||
                  "—";

                const received = formatBookingReceived(
                  booking.createdAt
                );

                return (
                  <tr key={booking._id || bookingId}>
                    <td className="ps-4">
                      <span className="fw-bold text-primary">
                        #{bookingId}
                      </span>
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {booking.customerName ||
                          booking.userId?.name ||
                          "Customer"}
                      </div>

                      <small className="text-muted">
                        {booking.phone ||
                          booking.userId?.phone ||
                          "—"}
                      </small>
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {getName(service, "Appointment")}
                      </div>

                      <small className="text-muted text-capitalize">
                        {service?.category || "—"}
                      </small>
                    </td>

                    <td>{getName(staff, "Not assigned")}</td>

                    {/* Booking Received Date & Time */}
                    <td>
                      {received ? (
                        <>
                          <div className="fw-semibold">
                            {received.date}
                          </div>

                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {received.time}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Appointment Date & Time */}
                    <td>
                      <div className="fw-semibold">
                        {formatDate(booking.appointmentDate)}
                      </div>

                      <small className="text-muted">
                        {formatTime(booking.startTime)}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill px-3 py-2 text-capitalize ${
                          statusClass[status] ||
                          "bg-secondary-subtle text-secondary"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          title="View booking"
                          onClick={() => onView(booking)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {status !== "cancelled" &&
                          status !== "completed" && (
                            <>
                              <select
                                aria-label="Change booking status"
                                className="form-select form-select-sm"
                                style={{ width: "125px" }}
                                value={status}
                                onChange={(e) =>
                                  onStatusChange(
                                    booking._id,
                                    e.target.value
                                  )
                                }
                              >
                                {BOOKING_STATUS_OPTIONS.filter(
                                  (item) =>
                                    item.value !== "cancelled"
                                ).map((item) => (
                                  <option
                                    key={item.value}
                                    value={item.value}
                                  >
                                    {item.label}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Cancel booking"
                                onClick={() => onCancel(booking)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingTable;
