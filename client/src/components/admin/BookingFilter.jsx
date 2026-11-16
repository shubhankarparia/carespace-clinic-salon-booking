
import React from "react";
import {
  BOOKING_STATUS_OPTIONS,
  CATEGORY_OPTIONS
} from "../../utils/constants";

function BookingFilter({
  filters = {},
  onFilterChange = () => {},
  onReset = () => {}
}) {
  const updateFilter = (name, value) => {
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Filter Bookings</h5>
            <small className="text-muted">
              Find and manage appointments
            </small>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onReset}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset
          </button>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label small fw-semibold">
              Search
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Customer, phone or booking ID"
                value={filters.search || ""}
                onChange={(e) =>
                  updateFilter("search", e.target.value)
                }
              />
            </div>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <label className="form-label small fw-semibold">
              Category
            </label>
            <select
              className="form-select"
              value={filters.category || ""}
              onChange={(e) =>
                updateFilter("category", e.target.value)
              }
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-6 col-lg-3">
            <label className="form-label small fw-semibold">
              Booking Status
            </label>
            <select
              className="form-select"
              value={filters.status || ""}
              onChange={(e) =>
                updateFilter("status", e.target.value)
              }
            >
              <option value="">All Statuses</option>
              {BOOKING_STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label small fw-semibold">
              Appointment Date
            </label>
            <input
              type="date"
              className="form-control"
              value={filters.date || ""}
              onChange={(e) =>
                updateFilter("date", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFilter;
