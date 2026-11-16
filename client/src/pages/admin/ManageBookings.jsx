
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import {
  PageHeader,
  Panel,
  DataTable,
  SearchBox,
  StatusBadge,
  ErrorMessage,
  formatDate,
  getList,
  getError,
} from "./AdminComponents";

export default function ManageBookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // LOAD BOOKINGS
  // ==========================================

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      // Admin booking list endpoint
      const response = await api.get("/admin/bookings");

      setItems(getList(response));
    } catch (err) {
      setError(getError(err, "Unable to load bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ==========================================
  // UPDATE BOOKING STATUS
  // ==========================================

  const updateStatus = async (booking, newStatus) => {
    if (!newStatus || newStatus === booking.status) {
      return;
    }

    setError("");
    setUpdatingId(booking._id);

    try {
      // Correct API endpoint: PATCH /api/bookings/:id/status
      await api.patch(`/bookings/${booking._id}/status`, {
        status: newStatus,
      });

      await loadBookings();
    } catch (err) {
      setError(
        getError(err, "Unable to update booking status.")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const customerName =
        item.customerName ||
        [
          item.customer?.firstName,
          item.customer?.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        "";

      const text = [
        item.bookingNumber,
        item.bookingId,
        item._id,
        customerName,
        item.customer?.email,
        item.customer?.phone,
        item.customerEmail,
        item.customerPhone,
        item.service?.name,
        item.staff?.name,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        status === "all" || item.status === status;

      const itemCategory =
        item.category || item.service?.category;

      const matchesCategory =
        category === "all" || itemCategory === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [items, search, status, category]);

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [
    {
      key: "bookingNumber",
      label: "Booking ID",
      render: (row) =>
        row.bookingNumber ||
        row.bookingId ||
        row._id?.slice(-8) ||
        "—",
    },
    // ==========================================
    // BOOKING RECEIVED DATE & TIME
    // ==========================================

    {
      key: "createdAt",
      label: "Booking Received",
      render: (row) => {
        if (!row.createdAt) {
          return "—";
        }

        const receivedDate = new Date(row.createdAt);

        if (Number.isNaN(receivedDate.getTime())) {
          return "—";
        }

        return (
          <div>
            <strong>
              {receivedDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Kolkata",
              })}
            </strong>

            <small className="d-block text-muted">
              {receivedDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              })}
            </small>
          </div>
        );
      },
    },


    {
      key: "customer",
      label: "Customer",
      render: (row) => {
        const name =
          row.customerName ||
          [
            row.customer?.firstName,
            row.customer?.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          "—";

        const phone =
          row.customerPhone ||
          row.customer?.phone ||
          "—";

        return (
          <div>
            <strong>{name}</strong>

            <small className="d-block text-muted">
              {phone}
            </small>
          </div>
        );
      },
    },

    {
      key: "service",
      label: "Service",
      render: (row) =>
        row.service?.name || "—",
    },

    {
      key: "staff",
      label: "Staff",
      render: (row) =>
        row.staff?.name || "—",
    },

    {
      key: "appointmentDate",
      label: "Date & Time",
      render: (row) => (
        <div>
          {formatDate(row.appointmentDate)}

          <small className="d-block text-muted">
            {row.startTime || "—"}
          </small>
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },

    {
      key: "update",
      label: "Update Status",
      render: (row) => (
        <select
          className="form-select form-select-sm admin-status-select"
          value={row.status || "pending"}
          disabled={updatingId === row._id}
          onChange={(e) =>
            updateStatus(row, e.target.value)
          }
        >
          {[
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "rejected",
          ].map((value) => (
            <option key={value} value={value}>
              {value.charAt(0).toUpperCase() +
                value.slice(1)}
            </option>
          ))}
        </select>
      ),
    },

    {
      key: "actions",
      label: "Details",
      render: (row) => (
        <Link
          className="admin-icon-action view"
          to={`/admin/bookings/${row._id}`}
          title="View booking details"
          aria-label="View booking details"
        >
          <i className="bi bi-eye" />
        </Link>
      ),
    },
  ];

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="admin-page-content">
      <PageHeader
        title="Manage Bookings"
        subtitle="View, filter and update customer appointments."
        icon="bi-calendar-check"
        action={
          <button
            type="button"
            className="btn btn-primary admin-action-btn"
            onClick={loadBookings}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2" />
            {loading ? "Loading..." : "Refresh"}
          </button>
        }
      />

      <ErrorMessage
        message={error}
        onRetry={loadBookings}
      />

      <Panel
        title="All Appointments"
        subtitle={`${filtered.length} booking(s)`}
      >
        <div className="admin-filter-row mb-3">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search customer or booking ID..."
          />

          <select
            className="form-select admin-filter-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="form-select admin-filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="clinic">Clinic</option>
            <option value="salon">Salon</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
        />
      </Panel>
    </div>
  );
}
