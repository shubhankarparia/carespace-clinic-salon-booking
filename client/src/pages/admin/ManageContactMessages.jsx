
import React, { useCallback, useEffect, useState } from "react";

// ==========================================
// CONFIGURATION
// ==========================================

// Set VITE_API_URL in your client/.env file if
// your backend uses a different URL.
//
// Example:
// VITE_API_URL=http://localhost:5001/api

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const CONTACT_API = `${API_BASE_URL}/contact`;

const PAGE_LIMIT = 10;

// ==========================================
// AUTHENTICATION HELPER
// ==========================================

const getAuthToken = () => {
  const possibleKeys = [
    "token",
    "authToken",
    "accessToken",
    "userToken",
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  // Also support projects that store authentication
  // information inside a user object.
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
      user?.token ||
      user?.accessToken ||
      user?.access_token ||
      null
    );
  } catch {
    return null;
  }
};

// ==========================================
// API HELPER
// ==========================================

const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message ||
      result.error ||
      `Request failed with status ${response.status}`
    );
  }

  return result;
};

// Supports common API response formats.
const extractMessages = (result) => {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.data?.data)) {
    return result.data.data;
  }

  if (Array.isArray(result.messages)) {
    return result.messages;
  }

  return [];
};


const extractPagination = (result, fallbackPage = 1) => {
  const pagination =
    result?.pagination ||
    result?.data?.pagination ||
    {};

  return {
    page: Number(pagination.page || fallbackPage),

    totalPages: Math.max(
      1,
      Number(pagination.totalPages || 1)
    ),

    total: Number(
      pagination.total ??
      pagination.totalItems ??
      0
    ),
  };
};


// ==========================================
// DATE FORMATTER
// ==========================================

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================
// STATUS BADGE
// ==========================================

function ContactStatusBadge({ status }) {
  const statusConfig = {
    new: {
      label: "New",
      className: "contact-status-new",
      icon: "bi-envelope-fill",
    },
    read: {
      label: "Read",
      className: "contact-status-read",
      icon: "bi-envelope-open-fill",
    },
    resolved: {
      label: "Resolved",
      className: "contact-status-resolved",
      icon: "bi-check-circle-fill",
    },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`contact-status ${config.className}`}>
      <i className={`bi ${config.icon}`} />
      {config.label}
    </span>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function ContactStatCard({
  title,
  value,
  icon,
  color,
  description,
}) {
  return (
    <div className="contact-stat-card">
      <div className={`contact-stat-icon ${color}`}>
        <i className={`bi ${icon}`} />
      </div>

      <div className="contact-stat-content">
        <span>{title}</span>

        <h3>{value}</h3>

        <small>{description}</small>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ManageContactMessages() {
  // ----------------------------------------
  // STATES
  // ----------------------------------------

  const [messages, setMessages] = useState([]);

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [adminNote, setAdminNote] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // ----------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");

    window.setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  // ----------------------------------------
  // FETCH CONTACT MESSAGES
  // ----------------------------------------

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(PAGE_LIMIT));

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const result = await apiRequest(
        `${CONTACT_API}?${params.toString()}`
      );

      const messageList = extractMessages(result);

      setMessages(messageList);

      setPagination(
        extractPagination(result, page)
      );
    } catch (err) {
      showError(
        err.message || "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ----------------------------------------
  // SEARCH HANDLER
  // ----------------------------------------

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // ----------------------------------------
  // STATUS FILTER HANDLER
  // ----------------------------------------

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  // ----------------------------------------
  // OPEN MESSAGE DETAILS
  // ----------------------------------------

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setAdminNote(message.adminNote || "");
    setDetailsLoading(true);

    try {
      const result = await apiRequest(
        `${CONTACT_API}/${message._id}`
      );

      const details =
        result.data?.data ||
        result.data ||
        result.message ||
        result;

      if (details && details._id) {
        setSelectedMessage(details);
        setAdminNote(details.adminNote || "");
      }
    } catch (err) {
      showError(
        err.message || "Unable to load message details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ----------------------------------------
  // CLOSE MESSAGE DETAILS
  // ----------------------------------------

  const closeDetails = () => {
    setSelectedMessage(null);
    setAdminNote("");
  };

  // ----------------------------------------
  // UPDATE MESSAGE STATUS
  // ----------------------------------------

  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      await apiRequest(
        `${CONTACT_API}/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            adminNote:
              id === selectedMessage?._id
                ? adminNote
                : undefined,
          }),
        }
      );

      showSuccess("Message status updated successfully.");

      if (selectedMessage?._id === id) {
        setSelectedMessage((previous) => ({
          ...previous,
          status,
        }));
      }

      await fetchMessages();
    } catch (err) {
      showError(
        err.message || "Unable to update message status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ----------------------------------------
  // SAVE ADMIN NOTE
  // ----------------------------------------

  const handleSaveNote = async () => {
    if (!selectedMessage?._id) return;

    try {
      setSaving(true);

      await apiRequest(
        `${CONTACT_API}/${selectedMessage._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: selectedMessage.status,
            adminNote: adminNote.trim(),
          }),
        }
      );

      setSelectedMessage((previous) => ({
        ...previous,
        adminNote: adminNote.trim(),
      }));

      showSuccess("Admin note saved successfully.");

      await fetchMessages();
    } catch (err) {
      showError(
        err.message || "Unable to save admin note."
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // DELETE MESSAGE
  // ----------------------------------------

  const handleDeleteMessage = async (message) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the message from ${message.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(message._id);

      await apiRequest(
        `${CONTACT_API}/${message._id}`,
        {
          method: "DELETE",
        }
      );

      if (selectedMessage?._id === message._id) {
        closeDetails();
      }

      showSuccess("Contact message deleted successfully.");

      await fetchMessages();
    } catch (err) {
      showError(
        err.message || "Unable to delete contact message."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ----------------------------------------
  // REFRESH
  // ----------------------------------------

  const handleRefresh = () => {
    fetchMessages();
  };

  // ----------------------------------------
  // PAGE NAVIGATION
  // ----------------------------------------

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages
    ) {
      return;
    }

    setPage(nextPage);
  };

  // ----------------------------------------
  // STATISTICS
  // ----------------------------------------

  // The current listing is paginated, so these
  // counts describe the currently loaded page only.
  const newCount = messages.filter(
    (message) => message.status === "new"
  ).length;

  const readCount = messages.filter(
    (message) => message.status === "read"
  ).length;

  const resolvedCount = messages.filter(
    (message) => message.status === "resolved"
  ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="admin-page contact-messages-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="contact-page-header">
        <div>
          <div className="contact-breadcrumb">
            <span>Admin</span>
            <i className="bi bi-chevron-right" />
            <span>Communication</span>
            <i className="bi bi-chevron-right" />
            <strong>Contact Messages</strong>
          </div>

          <h2>
            Contact Messages
          </h2>

          <p>
            Manage customer enquiries and respond to messages.
          </p>
        </div>

        <button
          type="button"
          className="contact-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise" />
          Refresh
        </button>
      </div>

      {/* =====================================
          ALERT MESSAGES
      ===================================== */}

      {success && (
        <div className="alert alert-success contact-alert">
          <i className="bi bi-check-circle-fill me-2" />
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger contact-alert">
          <i className="bi bi-exclamation-circle-fill me-2" />
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* =====================================
          STATISTICS
      ===================================== */}

      <div className="contact-stats-grid">

        <ContactStatCard
          title="Total Messages"
          value={pagination.total}
          icon="bi-envelope"
          color="blue"
          description="Matching messages"
        />

        <ContactStatCard
          title="New Messages"
          value={newCount}
          icon="bi-envelope-fill"
          color="orange"
          description="On this page"
        />

        <ContactStatCard
          title="Read Messages"
          value={readCount}
          icon="bi-envelope-open"
          color="purple"
          description="On this page"
        />

        <ContactStatCard
          title="Resolved"
          value={resolvedCount}
          icon="bi-check-circle"
          color="green"
          description="On this page"
        />

      </div>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="contact-content-card">

        {/* Toolbar */}

        <div className="contact-toolbar">

          <div className="contact-toolbar-heading">
            <h5>All Enquiries</h5>

            <span>
              {pagination.total} messages
            </span>
          </div>

          <div className="contact-toolbar-controls">

            {/* Search */}

            <div className="contact-search">
              <i className="bi bi-search" />

              <input
                type="search"
                placeholder="Search name, email or subject..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Status Filter */}

            <select
              className="contact-filter-select"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="all">All Messages</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>

          </div>

        </div>

        {/* =====================================
            MESSAGE TABLE
        ===================================== */}

        <div className="contact-table-wrapper">

          <table className="table contact-table">

            <thead>
              <tr>
                <th>CONTACT PERSON</th>
                <th>SUBJECT</th>
                <th>DATE RECEIVED</th>
                <th>STATUS</th>
                <th className="text-end">ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="contact-loading">
                      <div className="spinner-border text-primary" />

                      <p>Loading contact messages...</p>
                    </div>
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="contact-empty">
                      <div className="contact-empty-icon">
                        <i className="bi bi-inbox" />
                      </div>

                      <h5>No messages found</h5>

                      <p>
                        Contact form submissions will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr key={message._id}>

                    {/* Contact Person */}

                    <td>
                      <div className="contact-person">

                        <div className="contact-avatar">
                          {message.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>{message.name}</strong>

                          <span>{message.email}</span>
                        </div>

                      </div>
                    </td>

                    {/* Subject */}

                    <td>
                      <div className="contact-subject">
                        {message.subject}
                      </div>

                      <small className="contact-message-preview">
                        {message.message?.slice(0, 65)}
                        {message.message?.length > 65 ? "..." : ""}
                      </small>
                    </td>

                    {/* Date */}

                    <td>
                      <span className="contact-date">
                        {formatDate(message.createdAt)}
                      </span>
                    </td>

                    {/* Status */}

                    <td>
                      <ContactStatusBadge
                        status={message.status}
                      />
                    </td>

                    {/* Actions */}

                    <td>
                      <div className="contact-action-buttons">

                        <button
                          type="button"
                          className="contact-action-btn view"
                          title="View message"
                          onClick={() => handleViewMessage(message)}
                        >
                          <i className="bi bi-eye" />
                        </button>

                        <button
                          type="button"
                          className="contact-action-btn delete"
                          title="Delete message"
                          disabled={deletingId === message._id}
                          onClick={() => handleDeleteMessage(message)}
                        >
                          {deletingId === message._id ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <i className="bi bi-trash3" />
                          )}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        {/* =====================================
            PAGINATION
        ===================================== */}

        {!loading && messages.length > 0 && (
          <div className="contact-pagination">

            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="contact-pagination-buttons">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <i className="bi bi-chevron-left" />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
                <i className="bi bi-chevron-right" />
              </button>

            </div>

          </div>
        )}

      </div>

      {/* =====================================
          MESSAGE DETAILS MODAL
      ===================================== */}

      {selectedMessage && (
        <div
          className="contact-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >

          <div
            className="contact-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-details-title"
          >

            {/* Modal Header */}

            <div className="contact-modal-header">

              <div>
                <span>MESSAGE DETAILS</span>

                <h4 id="contact-details-title">
                  Customer Enquiry
                </h4>
              </div>

              <button
                type="button"
                className="contact-modal-close"
                onClick={closeDetails}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>

            </div>

            {/* Modal Body */}

            <div className="contact-modal-body">

              {detailsLoading ? (
                <div className="contact-loading">
                  <div className="spinner-border text-primary" />

                  <p>Loading message details...</p>
                </div>
              ) : (
                <>

                  {/* Sender Information */}

                  <div className="contact-detail-person">

                    <div className="contact-detail-avatar">
                      {selectedMessage.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <h5>{selectedMessage.name}</h5>

                      <a href={`mailto:${selectedMessage.email}`}>
                        {selectedMessage.email}
                      </a>
                    </div>

                  </div>

                  {/* Contact Information */}

                  <div className="contact-detail-grid">

                    <div>
                      <label>Subject</label>
                      <p>{selectedMessage.subject}</p>
                    </div>

                    <div>
                      <label>Received On</label>
                      <p>{formatDate(selectedMessage.createdAt)}</p>
                    </div>

                    <div>
                      <label>Current Status</label>
                      <p>
                        <ContactStatusBadge
                          status={selectedMessage.status}
                        />
                      </p>
                    </div>

                    <div>
                      <label>Sender Email</label>
                      <p>{selectedMessage.email}</p>
                    </div>

                  </div>

                  {/* Message */}

                  <div className="contact-message-content">

                    <label>
                      <i className="bi bi-chat-left-text me-2" />
                      Message
                    </label>

                    <div>
                      {selectedMessage.message}
                    </div>

                  </div>

                  {/* Status Update */}

                  <div className="contact-status-editor">

                    <label htmlFor="contactStatus">
                      Update Message Status
                    </label>

                    <select
                      id="contactStatus"
                      className="form-select"
                      value={selectedMessage.status || "new"}
                      disabled={updatingId === selectedMessage._id}
                      onChange={(event) =>
                        handleUpdateStatus(
                          selectedMessage._id,
                          event.target.value
                        )
                      }
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                    </select>

                  </div>

                  {/* Admin Note */}

                  <div className="contact-admin-note">

                    <label htmlFor="adminNote">
                      <i className="bi bi-journal-text me-2" />
                      Internal Admin Note
                    </label>

                    <textarea
                      id="adminNote"
                      rows="4"
                      maxLength="1000"
                      placeholder="Write an internal note about this enquiry..."
                      value={adminNote}
                      onChange={(event) =>
                        setAdminNote(event.target.value)
                      }
                    />

                    <div className="contact-note-footer">

                      <small>
                        {adminNote.length}/1000 characters
                      </small>

                      <button
                        type="button"
                        className="contact-save-note-btn"
                        onClick={handleSaveNote}
                        disabled={saving || detailsLoading}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-save me-2" />
                            Save Note
                          </>
                        )}
                      </button>

                    </div>

                  </div>

                </>
              )}

            </div>

            {/* Modal Footer */}

            <div className="contact-modal-footer">

              <button
                type="button"
                className="contact-modal-delete"
                onClick={() => handleDeleteMessage(selectedMessage)}
                disabled={deletingId === selectedMessage._id}
              >
                <i className="bi bi-trash3 me-2" />
                Delete Message
              </button>

              <button
                type="button"
                className="contact-modal-done"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================
          PAGE STYLES
      ===================================== */}

      <style>{`

        .contact-messages-page {
          width: 100%;
          min-width: 0;
          padding-bottom: 30px;
          color: #172033;
        }

        .contact-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .contact-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #8a94a6;
          font-size: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .contact-breadcrumb i {
          font-size: 9px;
        }

        .contact-breadcrumb strong {
          color: #475569;
          font-weight: 600;
        }

        .contact-page-header h2 {
          font-size: 26px;
          font-weight: 750;
          margin: 0 0 7px;
          color: #172033;
        }

        .contact-page-header p {
          color: #8290a5;
          margin: 0;
          font-size: 14px;
        }

        .contact-refresh-btn {
          border: 1px solid #dce4f0;
          background: #fff;
          color: #34445d;
          padding: 10px 16px;
          border-radius: 9px;
          font-weight: 600;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: .2s ease;
        }

        .contact-refresh-btn:hover:not(:disabled) {
          background: #f2f6ff;
          border-color: #9eb9f5;
          color: #2857bd;
        }

        .contact-refresh-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .contact-alert {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          border-radius: 10px;
        }

        .contact-alert .btn-close {
          margin-left: auto;
        }

        .contact-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-bottom: 24px;
        }

        .contact-stat-card {
          background: #fff;
          border: 1px solid #e9edf4;
          border-radius: 13px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          box-shadow: 0 3px 12px rgba(30, 50, 90, .025);
        }

        .contact-stat-icon {
          width: 48px;
          height: 48px;
          min-width: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .contact-stat-icon.blue {
          background: #eaf1ff;
          color: #3768d8;
        }

        .contact-stat-icon.orange {
          background: #fff3e5;
          color: #ed922f;
        }

        .contact-stat-icon.purple {
          background: #f2eaff;
          color: #8955d6;
        }

        .contact-stat-icon.green {
          background: #e6f8ef;
          color: #239b65;
        }

        .contact-stat-content {
          min-width: 0;
        }

        .contact-stat-content span {
          color: #8290a5;
          font-size: 12px;
          font-weight: 600;
        }

        .contact-stat-content h3 {
          color: #172033;
          font-size: 25px;
          font-weight: 750;
          margin: 3px 0;
        }

        .contact-stat-content small {
          color: #a0aabb;
          font-size: 11px;
        }

        .contact-content-card {
          background: #fff;
          border: 1px solid #e9edf4;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 3px 12px rgba(30, 50, 90, .025);
        }

        .contact-toolbar {
          padding: 21px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .contact-toolbar-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-toolbar-heading h5 {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
          color: #172033;
        }

        .contact-toolbar-heading span {
          font-size: 11px;
          color: #64748b;
          background: #f1f4f9;
          padding: 5px 9px;
          border-radius: 20px;
        }

        .contact-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-search {
          width: 270px;
          position: relative;
        }

        .contact-search > i {
          position: absolute;
          top: 50%;
          left: 13px;
          transform: translateY(-50%);
          color: #91a0b5;
          font-size: 14px;
        }

        .contact-search input {
          width: 100%;
          height: 41px;
          border: 1px solid #e0e6ef;
          border-radius: 8px;
          outline: none;
          padding: 0 12px 0 37px;
          color: #334155;
          font-size: 12px;
          background: #fff;
        }

        .contact-search input:focus {
          border-color: #7da5ef;
          box-shadow: 0 0 0 3px rgba(59, 110, 210, .08);
        }

        .contact-filter-select {
          height: 41px;
          min-width: 145px;
          border: 1px solid #e0e6ef;
          border-radius: 8px;
          outline: none;
          padding: 0 12px;
          color: #475569;
          font-size: 12px;
          background: #fff;
        }

        .contact-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .contact-table {
          min-width: 800px;
          margin: 0;
          vertical-align: middle;
        }

        .contact-table thead th {
          padding: 15px 18px;
          background: #fafbfd;
          border-bottom: 1px solid #edf0f5;
          color: #8b97aa;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .6px;
          white-space: nowrap;
        }

        .contact-table tbody td {
          padding: 16px 18px;
          border-bottom: 1px solid #f0f2f6;
          color: #46546a;
          font-size: 12px;
        }

        .contact-table tbody tr:last-child td {
          border-bottom: none;
        }

        .contact-table tbody tr:hover {
          background: #fbfcff;
        }

        .contact-person {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 180px;
        }

        .contact-avatar,
        .contact-detail-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #e4edff, #dce5ff);
          color: #3566c8;
          font-weight: 750;
          flex-shrink: 0;
        }

        .contact-avatar {
          width: 39px;
          height: 39px;
          font-size: 15px;
        }

        .contact-person strong {
          display: block;
          color: #27364e;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .contact-person span {
          display: block;
          color: #8b98aa;
          font-size: 11px;
        }

        .contact-subject {
          color: #34445d;
          font-size: 12px;
          font-weight: 650;
          max-width: 230px;
        }

        .contact-message-preview {
          display: block;
          color: #9aa5b5;
          font-size: 10px;
          margin-top: 5px;
          max-width: 230px;
        }

        .contact-date {
          color: #738198;
          white-space: nowrap;
          font-size: 11px;
        }

        .contact-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 30px;
          padding: 6px 10px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .contact-status-new {
          background: #fff3e4;
          color: #d98422;
        }

        .contact-status-read {
          background: #edf2ff;
          color: #526fc5;
        }

        .contact-status-resolved {
          background: #e7f8ef;
          color: #269564;
        }

        .contact-action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 7px;
        }

        .contact-action-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e6eaf1;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          font-size: 13px;
          transition: .2s ease;
        }

        .contact-action-btn.view {
          color: #416ac4;
        }

        .contact-action-btn.view:hover {
          background: #edf3ff;
          border-color: #b9cbf2;
        }

        .contact-action-btn.delete {
          color: #d85d66;
        }

        .contact-action-btn.delete:hover {
          background: #fff0f0;
          border-color: #f1c2c5;
        }

        .contact-action-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .contact-loading,
        .contact-empty {
          padding: 45px 20px;
          text-align: center;
          color: #8794a8;
        }

        .contact-loading .spinner-border {
          width: 27px;
          height: 27px;
        }

        .contact-loading p {
          margin: 12px 0 0;
          font-size: 12px;
        }

        .contact-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 13px;
          background: #f0f4fb;
          color: #7b91b6;
          font-size: 25px;
        }

        .contact-empty h5 {
          color: #34445d;
          font-size: 15px;
          font-weight: 700;
        }

        .contact-empty p {
          font-size: 12px;
          margin: 5px 0 0;
        }

        .contact-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 16px 21px;
          border-top: 1px solid #edf0f5;
        }

        .contact-pagination > span {
          color: #8794a8;
          font-size: 11px;
        }

        .contact-pagination-buttons {
          display: flex;
          gap: 8px;
        }

        .contact-pagination-buttons button {
          border: 1px solid #e1e7ef;
          background: #fff;
          color: #52627a;
          border-radius: 7px;
          padding: 8px 12px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .contact-pagination-buttons button:hover:not(:disabled) {
          background: #f1f5ff;
          color: #315fc0;
          border-color: #c1d1f4;
        }

        .contact-pagination-buttons button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        /* ===================================
           DETAILS MODAL
        =================================== */

        .contact-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1100;
          padding: 20px;
          background: rgba(15, 23, 42, .55);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          backdrop-filter: blur(3px);
        }

        .contact-details-modal {
          width: 100%;
          max-width: 650px;
          max-height: calc(100vh - 40px);
          background: #fff;
          border-radius: 15px;
          overflow: auto;
          box-shadow: 0 20px 70px rgba(0, 0, 0, .2);
          animation: contactModalIn .2s ease;
        }

        @keyframes contactModalIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 22px 25px;
          border-bottom: 1px solid #edf0f5;
        }

        .contact-modal-header span {
          color: #7c8ba4;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .contact-modal-header h4 {
          margin: 5px 0 0;
          color: #1d2b43;
          font-size: 19px;
          font-weight: 750;
        }

        .contact-modal-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #f2f4f8;
          color: #65738a;
        }

        .contact-modal-close:hover {
          background: #e8edf5;
          color: #263954;
        }

        .contact-modal-body {
          padding: 24px 25px;
        }

        .contact-detail-person {
          display: flex;
          align-items: center;
          gap: 13px;
          padding-bottom: 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .contact-detail-avatar {
          width: 51px;
          height: 51px;
          font-size: 19px;
        }

        .contact-detail-person h5 {
          color: #263750;
          font-size: 15px;
          font-weight: 750;
          margin: 0 0 5px;
        }

        .contact-detail-person a {
          color: #4772ca;
          font-size: 12px;
          text-decoration: none;
        }

        .contact-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 21px 0;
        }

        .contact-detail-grid label,
        .contact-message-content label,
        .contact-status-editor label,
        .contact-admin-note label {
          display: block;
          color: #8794a8;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .contact-detail-grid p {
          color: #34445d;
          font-size: 12px;
          font-weight: 600;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .contact-message-content {
          margin-bottom: 22px;
        }

        .contact-message-content > div {
          background: #f7f9fc;
          border: 1px solid #edf0f5;
          border-radius: 9px;
          padding: 16px;
          color: #46566d;
          font-size: 13px;
          line-height: 1.8;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .contact-status-editor {
          margin-bottom: 22px;
        }

        .contact-status-editor .form-select {
          border-color: #e0e6ef;
          border-radius: 8px;
          font-size: 12px;
          min-height: 42px;
        }

        .contact-admin-note textarea {
          display: block;
          width: 100%;
          resize: vertical;
          border: 1px solid #e0e6ef;
          border-radius: 9px;
          padding: 12px;
          color: #34445d;
          font-size: 12px;
          outline: none;
        }

        .contact-admin-note textarea:focus {
          border-color: #7da5ef;
          box-shadow: 0 0 0 3px rgba(59, 110, 210, .08);
        }

        .contact-note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .contact-note-footer small {
          color: #9aa5b5;
          font-size: 10px;
        }

        .contact-save-note-btn {
          border: none;
          background: #315fc0;
          color: #fff;
          border-radius: 7px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: 650;
        }

        .contact-save-note-btn:hover:not(:disabled) {
          background: #244d9f;
        }

        .contact-save-note-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .contact-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 16px 25px;
          border-top: 1px solid #edf0f5;
          background: #fcfdff;
        }

        .contact-modal-delete {
          border: 1px solid #f1d1d3;
          background: #fff;
          color: #d6535d;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 11px;
          font-weight: 650;
        }

        .contact-modal-delete:hover {
          background: #fff1f1;
        }

        .contact-modal-done {
          border: none;
          background: #315fc0;
          color: #fff;
          border-radius: 8px;
          padding: 10px 22px;
          font-size: 12px;
          font-weight: 650;
        }

        .contact-modal-done:hover {
          background: #244d9f;
        }

        /* ===================================
           RESPONSIVE
        =================================== */

        @media (max-width: 1100px) {
          .contact-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .contact-page-header {
            align-items: flex-start;
          }

          .contact-page-header h2 {
            font-size: 22px;
          }

          .contact-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .contact-toolbar-controls {
            width: 100%;
          }

          .contact-search {
            flex: 1;
            width: auto;
          }

          .contact-filter-select {
            min-width: 125px;
          }
        }

        @media (max-width: 576px) {
          .contact-messages-page {
            padding-bottom: 20px;
          }

          .contact-page-header {
            flex-direction: column;
            gap: 13px;
          }

          .contact-page-header h2 {
            font-size: 21px;
          }

          .contact-refresh-btn {
            align-self: flex-start;
          }

          .contact-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .contact-stat-card {
            padding: 13px 10px;
            gap: 9px;
          }

          .contact-stat-icon {
            width: 37px;
            height: 37px;
            min-width: 37px;
            font-size: 16px;
            border-radius: 9px;
          }

          .contact-stat-content span {
            font-size: 10px;
          }

          .contact-stat-content h3 {
            font-size: 21px;
          }

          .contact-stat-content small {
            font-size: 9px;
          }

          .contact-toolbar {
            padding: 16px 13px;
          }

          .contact-toolbar-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .contact-search,
          .contact-filter-select {
            width: 100%;
          }

          .contact-pagination {
            padding: 14px 12px;
            flex-direction: column;
            align-items: flex-start;
          }

          .contact-pagination-buttons {
            width: 100%;
          }

          .contact-pagination-buttons button {
            flex: 1;
            justify-content: center;
          }

          .contact-modal-backdrop {
            padding: 10px;
            align-items: flex-end;
          }

          .contact-details-modal {
            max-height: calc(100vh - 20px);
            border-radius: 15px 15px 10px 10px;
          }

          .contact-modal-header,
          .contact-modal-body {
            padding: 18px 16px;
          }

          .contact-detail-grid {
            gap: 15px 10px;
          }

          .contact-modal-footer {
            padding: 14px 16px;
          }
        }

        @media (max-width: 360px) {
          .contact-stats-grid {
            grid-template-columns: 1fr;
          }

          .contact-detail-grid {
            grid-template-columns: 1fr;
          }

          .contact-modal-footer {
            align-items: stretch;
            flex-direction: column;
          }
        }

      `}</style>

    </div>
  );
}
