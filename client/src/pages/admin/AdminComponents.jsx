
import React from "react";
import Loader from "../../components/common/Loader";
import "./admin-pages.css";


export function PageHeader({ title, subtitle, icon = "bi-grid", action }) {
  return (
    <div className="admin-content-heading">
      <div>
        <div className="admin-content-eyebrow">
          <i className={`bi ${icon}`} /> ADMINISTRATION
        </div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, action, children }) {
  return (
    <section className="admin-panel">
      {(title || action) && (
        <div className="admin-panel-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="admin-panel-body">{children}</div>
    </section>
  );
}

export function StatCard({ title, value, icon, color = "blue", note }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value ?? 0}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const value = String(status || "pending").toLowerCase();
  const supported = ["pending", "confirmed", "cancelled", "completed", "active", "inactive"];
  const safe = supported.includes(value) ? value : "pending";

  return (
    <span className={`admin-status-badge ${safe}`}>
      <span />
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="admin-search-box">
      <i className="bi bi-search" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = "No records found.",
  rowKey = "_id"
}) {
  if (loading) return <Loader message="Loading records..." />;

  return (
    <div className="table-responsive">
      <table className="table admin-data-table align-middle">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={row[rowKey] || row.id || index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row, index)
                    : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="admin-table-empty">
                <i className="bi bi-inbox" />
                <span>{emptyMessage}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center gap-3">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  options,
  rows = 3,
  min,
  step
}) {
  return (
    <div className="mb-3">
      <label className="form-label admin-form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      {options ? (
        <select
          className="form-select admin-form-control"
          name={name}
          value={value ?? ""}
          onChange={onChange}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className="form-control admin-form-control"
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          className="form-control admin-form-control"
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
        />
      )}
    </div>
  );
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
}

export function getList(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.staff)) return data.staff;
  if (Array.isArray(data?.customers)) return data.customers;
  return [];
}

export function getError(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
}
