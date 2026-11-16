
import React, { useState } from "react";
import api from "../../services/api";

import {
  PageHeader,
  Panel,
  ErrorMessage,
  getError,
} from "./AdminComponents";

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "all",
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async (event) => {
    event.preventDefault();

    setError("");
    setReport(null);

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setError("Start date cannot be after end date.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/admin/reports", {
        params: filters,
      });

      setReport(response.data?.data || response.data);
    } catch (err) {
      setError(getError(err, "Unable to generate report."));
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report) return;

    const rows = report.bookings || [];

    if (!rows.length) {
      setError("There are no booking records to export.");
      return;
    }

    const headers = [
      "Booking Number",
      "Customer",
      "Email",
      "Phone",
      "Service",
      "Category",
      "Appointment Date",
      "Start Time",
      "End Time",
      "Status",
      "Payment Status",
      "Amount",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvRows = [
      headers,
      ...rows.map((row) => [
        row.bookingNumber || row._id,
        row.customerName,
        row.customerEmail,
        row.customerPhone,
        row.service?.name,
        row.category,
        row.appointmentDate
          ? new Date(row.appointmentDate).toLocaleDateString("en-IN")
          : "",
        row.startTime,
        row.endTime,
        row.status,
        row.paymentStatus,
        row.totalAmount,
      ]),
    ];

    const csv = csvRows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "carespace-appointment-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Bookings",
      value: report?.totalBookings ?? 0,
      icon: "bi-calendar-check",
    },
    {
      label: "Completed",
      value: report?.completedBookings ?? 0,
      icon: "bi-check-circle",
    },
    {
      label: "Cancelled",
      value: report?.cancelledBookings ?? 0,
      icon: "bi-x-circle",
    },
    {
      label: "Revenue",
      value: `₹${Number(report?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: "bi-currency-rupee",
    },
  ];

  return (
    <div className="admin-page-content">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Analyze appointments and business performance."
        icon="bi-graph-up-arrow"
        action={
          <button
            className="btn btn-outline-primary admin-action-btn"
            onClick={exportCSV}
            disabled={!report || !report.bookings?.length}
          >
            <i className="bi bi-download me-2" />
            Export CSV
          </button>
        }
      />

      <ErrorMessage message={error} />

      <Panel
        title="Generate Report"
        subtitle="Select a reporting period and category."
      >
        <form onSubmit={generateReport}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label admin-form-label">
                Start Date
              </label>

              <input
                type="date"
                className="form-control admin-form-control"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label admin-form-label">
                End Date
              </label>

              <input
                type="date"
                className="form-control admin-form-control"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label admin-form-label">
                Category
              </label>

              <select
                className="form-select admin-form-control"
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value,
                  })
                }
              >
                <option value="all">All Categories</option>
                <option value="clinic">Clinic</option>
                <option value="salon">Salon</option>
              </select>
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <i className="bi bi-bar-chart-line me-2" />
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </form>
      </Panel>

      {report && (
        <>
          <div className="row g-3 my-2">
            {stats.map((item) => (
              <div className="col-6 col-xl-3" key={item.label}>
                <div className="admin-report-stat">
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <Panel
            title="Category Performance"
            subtitle="Booking and completed revenue by business category."
          >
            <div className="table-responsive">
              <table className="table admin-data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Bookings</th>
                    <th>Completed</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {(report.categoryStats || []).map((item) => (
                    <tr key={item.category}>
                      <td className="text-capitalize">
                        {item.category}
                      </td>
                      <td>{item.totalBookings}</td>
                      <td>{item.completedBookings}</td>
                      <td>
                        ₹{Number(item.revenue || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Appointment Report"
            subtitle="Booking records for the selected period."
          >
            <div className="table-responsive">
              <table className="table admin-data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {(report.bookings || []).map((row, index) => (
                    <tr key={row._id || index}>
                      <td>
                        {row.bookingNumber || row._id}
                      </td>

                      <td>{row.customerName || "—"}</td>

                      <td>{row.service?.name || "—"}</td>

                      <td className="text-capitalize">
                        {row.category || "—"}
                      </td>

                      <td>
                        {row.appointmentDate
                          ? new Date(row.appointmentDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark text-capitalize">
                          {row.status || "—"}
                        </span>
                      </td>

                      <td className="text-capitalize">
                        {row.paymentStatus || "—"}
                      </td>

                      <td>
                        ₹{Number(row.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}

                  {!report.bookings?.length && (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        No booking records found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
