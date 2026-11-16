
import React, { useCallback, useEffect, useState } from "react";

import api from "../../services/api";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  PageHeader,
  Panel,
  DataTable,
  ErrorMessage,
  getList,
  getError,
  formatDate,
} from "./AdminComponents";

const HOLIDAY_TYPES = [
  { value: "public_holiday", label: "Public Holiday" },
  { value: "business_closed", label: "Business Closed" },
  { value: "staff_leave", label: "Staff Leave" },
  { value: "special_closure", label: "Special Closure" },
];

const emptyForm = {
  name: "",
  date: "",
  endDate: "",
  staff: "",
  type: "public_holiday",
  description: "",
  isRecurring: false,
};

const getHolidayList = (response) => {
  if (Array.isArray(response.data?.holidays)) {
    return response.data.holidays;
  }

  return getList(response);
};

export default function ManageHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // ==========================================
  // LOAD HOLIDAYS
  // ==========================================

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/schedules/holidays");

      setHolidays(getHolidayList(response));
    } catch (err) {
      setError(getError(err, "Unable to load holidays."));
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LOAD STAFF
  // ==========================================

  const loadStaff = useCallback(async () => {
    try {
      const response = await api.get("/staff");

      const list = getList(response);

      setStaffList(
        list.filter((person) => person.isActive !== false)
      );
    } catch (err) {
      console.error("Unable to load staff:", err);
    }
  }, []);

  useEffect(() => {
    load();
    loadStaff();
  }, [load, loadStaff]);

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (holiday) => {
    setEditingItem(holiday);

    setForm({
      name: holiday.name || "",
      date: holiday.date
        ? String(holiday.date).slice(0, 10)
        : "",
      endDate: holiday.endDate
        ? String(holiday.endDate).slice(0, 10)
        : "",
      staff:
        typeof holiday.staff === "object"
          ? holiday.staff?._id || ""
          : holiday.staff || "",
      type: holiday.type || "public_holiday",
      description: holiday.description || "",
      isRecurring: Boolean(holiday.isRecurring),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE HOLIDAY
  // ==========================================

  const submit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.date) {
      setError("Holiday name and date are required.");
      return;
    }

    if (form.endDate && form.endDate < form.date) {
      setError("End date cannot be before the start date.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        endDate: form.endDate || null,
        staff: form.staff || null,
      };

      if (editingItem) {
        await api.patch(
          `/schedules/holidays/${editingItem._id}`,
          payload
        );

        setSuccess("Holiday updated successfully.");
      } else {
        await api.post("/schedules/holidays", payload);

        setSuccess("Holiday added successfully.");
      }

      setShowForm(false);
      setEditingItem(null);
      setForm(emptyForm);

      await load();
    } catch (err) {
      setError(getError(err, "Unable to save holiday."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE HOLIDAY
  // ==========================================

  const remove = async () => {
    if (!deletingItem) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/schedules/holidays/${deletingItem._id}`
      );

      setDeletingItem(null);
      setSuccess("Holiday deleted successfully.");

      await load();
    } catch (err) {
      setError(getError(err, "Unable to delete holiday."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="admin-page-content">

      <PageHeader
        title="Manage Holidays"
        subtitle="Manage public holidays, business closures and staff leave."
        icon="bi-calendar-x"
        action={
          <button
            type="button"
            className="btn btn-primary admin-action-btn"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-lg me-2" />
            Add Holiday
          </button>
        }
      />

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2" />
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          />
        </div>
      )}

      <ErrorMessage
        message={error}
        onRetry={load}
      />

      <Panel
        title="Holiday Calendar"
        subtitle={`${holidays.length} holiday(s) configured`}
      >
        <DataTable
          loading={loading}
          rows={holidays}
          columns={[
            {
              key: "name",
              label: "Holiday Name",
              render: (row) => (
                <div>
                  <strong>{row.name}</strong>

                  {row.description && (
                    <div className="small text-muted">
                      {row.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "date",
              label: "Date",
              render: (row) => (
                <div>
                  {formatDate(row.date)}

                  {row.endDate && (
                    <div className="small text-muted">
                      To {formatDate(row.endDate)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "type",
              label: "Type",
              render: (row) =>
                HOLIDAY_TYPES.find(
                  (item) => item.value === row.type
                )?.label || row.type || "—",
            },
            {
              key: "staff",
              label: "Assigned To",
              render: (row) =>
                typeof row.staff === "object"
                  ? row.staff?.name || "Entire Business"
                  : staffList.find(
                      (person) => person._id === row.staff
                    )?.name || "Entire Business",
            },
            {
              key: "isRecurring",
              label: "Recurring",
              render: (row) =>
                row.isRecurring ? (
                  <span className="badge bg-success-subtle text-success">
                    Yes
                  </span>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary">
                    No
                  </span>
                ),
            },
            {
              key: "action",
              label: "Actions",
              render: (row) => (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="admin-icon-action"
                    title="Edit holiday"
                    onClick={() => openEditForm(row)}
                  >
                    <i className="bi bi-pencil-square" />
                  </button>

                  <button
                    type="button"
                    className="admin-icon-action delete"
                    title="Delete holiday"
                    onClick={() => setDeletingItem(row)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </Panel>

      {/* ADD / EDIT MODAL */}

      <Modal
        show={showForm}
        title={editingItem ? "Edit Holiday" : "Add Holiday"}
        onClose={() => {
          if (!saving) {
            setShowForm(false);
            setEditingItem(null);
          }
        }}
      >
        <form onSubmit={submit}>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Holiday Name *
            </label>

            <input
              className="form-control"
              name="name"
              required
              maxLength="150"
              placeholder="Example: Durga Puja"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Holiday Type
            </label>

            <select
              className="form-select"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              {HOLIDAY_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                Start Date *
              </label>

              <input
                type="date"
                className="form-control"
                name="date"
                required
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">
                End Date
              </label>

              <input
                type="date"
                className="form-control"
                name="endDate"
                min={form.date || undefined}
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Assign To
            </label>

            <select
              className="form-select"
              name="staff"
              value={form.staff}
              onChange={handleChange}
            >
              <option value="">Entire Business</option>

              {staffList.map((person) => (
                <option key={person._id} value={person._id}>
                  {person.name} {person.role ? `— ${person.role}` : ""}
                </option>
              ))}
            </select>

            <small className="text-muted">
              Select a staff member for individual leave, or
              choose Entire Business for a business-wide holiday.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Description
            </label>

            <textarea
              className="form-control"
              name="description"
              rows="3"
              maxLength="1000"
              placeholder="Optional holiday details..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="holidayRecurring"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
            />

            <label
              className="form-check-label"
              htmlFor="holidayRecurring"
            >
              Repeat this holiday every year
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                editingItem ? "Update Holiday" : "Save Holiday"
              )}
            </button>
          </div>

        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}

      <ConfirmDialog
        show={Boolean(deletingItem)}
        title="Remove Holiday?"
        message={`Remove ${deletingItem?.name || "this holiday"} from the calendar?`}
        confirmText="Remove"
        loading={saving}
        onCancel={() => setDeletingItem(null)}
        onConfirm={remove}
      />

    </div>
  );
}
