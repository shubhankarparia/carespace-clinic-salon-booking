
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api, {
  getApiErrorMessage,
} from "../../services/api";

import StatsCard from "../../components/admin/StatsCard";
import BookingFilter from "../../components/admin/BookingFilter";
import BookingTable from "../../components/admin/BookingTable";

// ==========================================
// DEFAULT FILTERS
// ==========================================

const EMPTY_FILTERS = {
  search: "",
  category: "",
  status: "",
  date: "",
};

// ==========================================
// RESPONSE HELPER
// ==========================================

const unwrap = (response) => {
  let result = response?.data;

  if (result?.data !== undefined) {
    result = result.data;
  }

  return result;
};

// ==========================================
// BOOKING STATUS COUNT
// ==========================================

const getBookingStatus = (bookings, status) =>
  bookings.filter(
    (booking) => booking.status === status
  ).length;

// ==========================================
// DASHBOARD COMPONENT
// ==========================================

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD AND BOOKING DATA
  // ==========================================

  const fetchDashboard = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      try {
        const [
          dashboardResult,
          bookingsResult,
        ] = await Promise.allSettled([
          api.get("/admin/dashboard"),
          api.get("/admin/bookings"),
        ]);

        let dashboard = {};
        let bookingList = [];

        // Dashboard response
        if (dashboardResult.status === "fulfilled") {
          dashboard =
            unwrap(dashboardResult.value) || {};
        } else {
          console.error(
            "Dashboard API:",
            dashboardResult.reason
          );
        }

        // Bookings response
        if (bookingsResult.status === "fulfilled") {
          const bookingData = unwrap(
            bookingsResult.value
          );

          bookingList = Array.isArray(bookingData)
            ? bookingData
            : bookingData?.bookings ||
              bookingData?.results ||
              [];
        } else {
          console.error(
            "Bookings API:",
            bookingsResult.reason
          );
        }

        // Both APIs failed
        if (
          dashboardResult.status === "rejected" &&
          bookingsResult.status === "rejected"
        ) {
          throw dashboardResult.reason;
        }

        setDashboardData(dashboard);
        setBookings(bookingList);

        // One API failed
        if (
          dashboardResult.status === "rejected" ||
          bookingsResult.status === "rejected"
        ) {
          setError(
            "Some dashboard information could not be loaded. Please check your backend APIs."
          );
        }
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================
  // INITIAL DASHBOARD LOAD
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    const source =
      dashboardData.stats || dashboardData;

    const total = Number(
      source.totalBookings ??
        source.total ??
        bookings.length
    );

    const confirmed = Number(
      source.confirmedBookings ??
        source.confirmed ??
        getBookingStatus(bookings, "confirmed")
    );

    const pending = Number(
      source.pendingBookings ??
        source.pending ??
        getBookingStatus(bookings, "pending")
    );

    const cancelled = Number(
      source.cancelledBookings ??
        source.cancelled ??
        getBookingStatus(bookings, "cancelled")
    );

    const completed = Number(
      source.completedBookings ??
        source.completed ??
        getBookingStatus(bookings, "completed")
    );

    const clinic = bookings.filter(
      (booking) =>
        String(
          booking.serviceId?.category ||
            booking.category ||
            ""
        ).toLowerCase() === "clinic"
    ).length;

    const salon = bookings.filter(
      (booking) =>
        String(
          booking.serviceId?.category ||
            booking.category ||
            ""
        ).toLowerCase() === "salon"
    ).length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
      completed,
      clinic,
      salon,
    };
  }, [dashboardData, bookings]);

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = filters.search
        .trim()
        .toLowerCase();

      const customerName =
        booking.customerName ||
        booking.userId?.name ||
        "";

      const phone =
        booking.phone ||
        booking.userId?.phone ||
        "";

      const bookingId =
        booking.bookingId ||
        booking._id ||
        "";

      const serviceName =
        booking.serviceId?.name ||
        "";

      const matchesSearch =
        !search ||
        customerName.toLowerCase().includes(search) ||
        String(phone).toLowerCase().includes(search) ||
        String(bookingId).toLowerCase().includes(search) ||
        serviceName.toLowerCase().includes(search);

      const category = String(
        booking.serviceId?.category ||
          booking.category ||
          ""
      ).toLowerCase();

      const matchesCategory =
        !filters.category ||
        category === filters.category.toLowerCase();

      const matchesStatus =
        !filters.status ||
        booking.status === filters.status;

      const bookingDate = booking.appointmentDate
        ? new Date(
            booking.appointmentDate
          ).toISOString().slice(0, 10)
        : "";

      const matchesDate =
        !filters.date ||
        bookingDate === filters.date;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [bookings, filters]);

  // ==========================================
  // UPDATE BOOKING STATUS
  // ==========================================

  const handleStatusChange = async (
    bookingId,
    status
  ) => {
    if (!bookingId || !status) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      // Correct backend route:
      // PATCH /api/bookings/:id/status

      await api.patch(
        `/bookings/${bookingId}/status`,
        {
          status,
        }
      );

      // Refresh dashboard after successful update
      await fetchDashboard(false);
    } catch (err) {
      const message = getApiErrorMessage(err);

      setError(message);
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${
        booking.bookingId || booking._id
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      // Correct backend route:
      // PATCH /api/bookings/:id/cancel

      await api.patch(
        `/bookings/${booking._id}/cancel`
      );

      // Refresh dashboard after cancellation
      await fetchDashboard(false);
    } catch (err) {
      const message = getApiErrorMessage(err);

      setError(message);
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const handleResetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
  };

  // ==========================================
  // RECENT BOOKINGS
  // ==========================================

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.appointmentDate || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.appointmentDate || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [bookings]);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" />

        <p className="text-muted mt-3 mb-0">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <div className="admin-dashboard">

      {/* PAGE HEADER */}

      <div className="dashboard-page-header">
        <div>
          <div className="dashboard-eyebrow">
            <i className="bi bi-grid-1x2-fill me-2" />
            ADMINISTRATION
          </div>

          <h2 className="dashboard-title">
            Dashboard Overview
          </h2>

          <p className="dashboard-subtitle">
            Welcome back! Here's what's happening at
            your clinic and salon.
          </p>
        </div>

        <div className="dashboard-header-actions">

          <button
            type="button"
            className="btn btn-light dashboard-refresh-btn"
            onClick={() => fetchDashboard(false)}
            disabled={refreshing || actionLoading}
          >
            <i
              className={`bi bi-arrow-clockwise me-2 ${
                refreshing ? "dashboard-spinning" : ""
              }`}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate("/admin/bookings")
            }
          >
            <i className="bi bi-calendar-plus me-2" />
            Manage Bookings
          </button>

        </div>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between gap-3">

          <span>
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </span>

          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={() => fetchDashboard()}
          >
            Retry
          </button>

        </div>
      )}

      {/* STATISTICS */}

      <div className="row g-3 g-xl-4 mb-4">

        <div className="col-6 col-xl-3">
          <StatsCard
            title="Total Bookings"
            value={stats.total}
            icon="bi-calendar-check"
            color="primary"
            subtitle="All appointments"
            onClick={() =>
              navigate("/admin/bookings")
            }
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatsCard
            title="Confirmed"
            value={stats.confirmed}
            icon="bi-check-circle"
            color="success"
            subtitle="Confirmed appointments"
            onClick={() => {
              setFilters({
                ...EMPTY_FILTERS,
                status: "confirmed",
              });
            }}
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon="bi-clock-history"
            color="warning"
            subtitle="Awaiting confirmation"
            onClick={() => {
              setFilters({
                ...EMPTY_FILTERS,
                status: "pending",
              });
            }}
          />
        </div>

        <div className="col-6 col-xl-3">
          <StatsCard
            title="Cancelled"
            value={stats.cancelled}
            icon="bi-calendar-x"
            color="danger"
            subtitle="Cancelled appointments"
            onClick={() => {
              setFilters({
                ...EMPTY_FILTERS,
                status: "cancelled",
              });
            }}
          />
        </div>

      </div>

      {/* CATEGORY AND COMPLETION SUMMARY */}

      <div className="row g-3 mb-4">

        <div className="col-12 col-lg-8">
          <div className="dashboard-panel h-100">

            <div className="dashboard-panel-header">
              <div>
                <h5>Business Overview</h5>
                <p>
                  Appointment distribution by category
                </p>
              </div>

              <span className="dashboard-header-icon">
                <i className="bi bi-bar-chart-line" />
              </span>
            </div>

            <div className="row g-3">

              <div className="col-6">
                <div className="category-summary clinic-summary">

                  <div className="category-summary-icon">
                    <i className="bi bi-hospital" />
                  </div>

                  <div>
                    <span>Clinic Bookings</span>
                    <h3>{stats.clinic}</h3>
                  </div>

                </div>
              </div>

              <div className="col-6">
                <div className="category-summary salon-summary">

                  <div className="category-summary-icon">
                    <i className="bi bi-scissors" />
                  </div>

                  <div>
                    <span>Salon Bookings</span>
                    <h3>{stats.salon}</h3>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="dashboard-panel h-100">

            <div className="dashboard-panel-header">
              <div>
                <h5>Completed Appointments</h5>
                <p>Successfully completed</p>
              </div>

              <span className="dashboard-header-icon success-icon">
                <i className="bi bi-check2-circle" />
              </span>
            </div>

            <div className="completed-summary">
              <h2>{stats.completed}</h2>
              <span>Completed bookings</span>
            </div>

            <div className="progress dashboard-progress">

              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${
                    stats.total > 0
                      ? Math.min(
                          (stats.completed / stats.total) * 100,
                          100
                        )
                      : 0
                  }%`,
                }}
                aria-valuenow={stats.completed}
                aria-valuemin="0"
                aria-valuemax={stats.total || 100}
              />

            </div>

          </div>
        </div>

      </div>

      {/* BOOKING FILTER */}

      <div className="dashboard-section-heading">
        <div>
          <h4>Appointment Management</h4>
          <p>
            Search and manage customer appointments.
          </p>
        </div>
      </div>

      <BookingFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* BOOKING TABLE */}

      <div className="dashboard-booking-wrapper">

        {actionLoading && (
          <div className="dashboard-action-indicator">
            <span className="spinner-border spinner-border-sm me-2" />
            Updating appointment...
          </div>
        )}

        <BookingTable
          bookings={filteredBookings}
          loading={false}
          onView={(booking) =>
            navigate(
              `/admin/bookings/${booking._id}`
            )
          }
          onStatusChange={handleStatusChange}
          onCancel={handleCancelBooking}
        />

      </div>

      {/* RECENT BOOKINGS */}

      <div className="dashboard-section-heading mt-4">

        <div>
          <h4>Recent Appointments</h4>
          <p>Your latest five booking records.</p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() =>
            navigate("/admin/bookings")
          }
        >
          View All
          <i className="bi bi-arrow-right ms-2" />
        </button>

      </div>

      {/* RECENT BOOKINGS TABLE */}

      <div className="dashboard-panel recent-bookings-panel">

        {recentBookings.length === 0 ? (

          <div className="text-center py-5">

            <i className="bi bi-calendar2-x display-5 text-muted" />

            <h6 className="fw-bold mt-3">
              No appointments yet
            </h6>

            <p className="text-muted small mb-0">
              New bookings will appear here.
            </p>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table align-middle mb-0">

              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Booking Received</th>
                  <th>Appointment Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {recentBookings.map((booking) => (

                  <tr key={booking._id}>

                    <td className="fw-semibold text-primary">
                      #{booking.bookingId || booking._id?.slice(-8)}
                    </td>

                    <td>
                      {booking.customerName ||
                        booking.userId?.name ||
                        "Customer"}
                    </td>

                    <td>
                      {booking.serviceId?.name ||
                        "Appointment"}
                    </td>

                    {/* Booking Received Date & Time */}
                    <td>
                      {booking.createdAt &&
                      !Number.isNaN(new Date(booking.createdAt).getTime()) ? (
                        <div>
                          <strong>
                            {new Date(booking.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                timeZone: "Asia/Kolkata",
                              }
                            )}
                          </strong>

                          <small className="d-block text-muted">
                            {new Date(booking.createdAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              }
                            )}
                          </small>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>


                    <td>
                      {booking.appointmentDate
                        ? new Date(
                            booking.appointmentDate
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill dashboard-status-badge status-${booking.status || "pending"}`}
                      >
                        {booking.status || "pending"}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;
