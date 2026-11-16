
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

// ==========================================
// CONSTANTS
// ==========================================

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const HOLIDAY_TYPES = [
  { value: "public_holiday", label: "Public Holiday" },
  { value: "business_closed", label: "Business Closed" },
  { value: "staff_leave", label: "Staff Leave" },
  { value: "special_closure", label: "Special Closure" },
];

const DEFAULT_TIME_SLOT = {
  startTime: "09:00",
  endTime: "18:00",
};

const createDefaultDay = (dayOfWeek) => ({
  _id: null,
  dayOfWeek,
  isOpen: dayOfWeek !== 0,
  timeSlots: dayOfWeek === 0 ? [] : [{ ...DEFAULT_TIME_SLOT }],
  breakStart: "",
  breakEnd: "",
  notes: "",
});

const createEmptyHoliday = () => ({
  name: "",
  date: "",
  endDate: "",
  staff: "",
  type: "public_holiday",
  description: "",
  isRecurring: false,
});

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getArray = (response, keys = []) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const formatDateInput = (value) => {
  if (!value) return "";

  // Avoid timezone shifts for ISO date strings.
  return String(value).slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = formatDateInput(value);
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ManageSchedule() {
  const [selectedStaff, setSelectedStaff] = useState("business");

  const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [holidayForm, setHolidayForm] = useState(createEmptyHoliday);
  const [editingHolidayId, setEditingHolidayId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD STAFF
  // ==========================================

  const loadStaff = useCallback(async () => {
    try {
      const response = await api.get("/staff");

      const staff = getArray(response, ["staff", "data"]);

      setStaffList(
        staff.filter((person) => person.isActive !== false)
      );
    } catch (err) {
      console.error("Staff loading error:", err);
    }
  }, []);

  // ==========================================
  // LOAD WORKING HOURS AND HOLIDAYS
  // ==========================================

  const loadScheduleData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const params = { staff: selectedStaff };

      const [scheduleResponse, holidayResponse] = await Promise.all([
        api.get("/schedules/working-hours", { params }),
        api.get("/schedules/holidays", { params }),
      ]);

      const scheduleData = getArray(scheduleResponse, ["schedules"]);
      const holidayData = getArray(holidayResponse, ["holidays"]);

      const updatedSchedules = DAYS.map((_, dayIndex) => {
        const existing = scheduleData.find(
          (item) => Number(item.dayOfWeek) === dayIndex
        );

        if (!existing) {
          return createDefaultDay(dayIndex);
        }

        return {
          _id: existing._id,
          dayOfWeek: dayIndex,
          isOpen: existing.isOpen,
          timeSlots:
            existing.timeSlots?.length > 0
              ? existing.timeSlots.map((slot) => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                }))
              : existing.isOpen
                ? [{ ...DEFAULT_TIME_SLOT }]
                : [],
          breakStart: existing.breakStart || "",
          breakEnd: existing.breakEnd || "",
          notes: existing.notes || "",
        };
      });

      setSchedules(updatedSchedules);
      setHolidays(holidayData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedStaff]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // ==========================================
  // SCHEDULE FORM HELPERS
  // ==========================================

  const updateDay = (dayIndex, field, value) => {
    setSchedules((previous) =>
      previous.map((day) =>
        day.dayOfWeek === dayIndex
          ? { ...day, [field]: value }
          : day
      )
    );

    setSuccess("");
  };

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    setSchedules((previous) =>
      previous.map((day) => {
        if (day.dayOfWeek !== dayIndex) return day;

        const updatedSlots = [...day.timeSlots];

        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          [field]: value,
        };

        return {
          ...day,
          timeSlots: updatedSlots,
        };
      })
    );

    setSuccess("");
  };

  const addTimeSlot = (dayIndex) => {
    setSchedules((previous) =>
      previous.map((day) => {
        if (day.dayOfWeek !== dayIndex) return day;

        const lastSlot = day.timeSlots[day.timeSlots.length - 1];

        const newStart = lastSlot?.endTime || "09:00";

        return {
          ...day,
          timeSlots: [
            ...day.timeSlots,
            {
              startTime: newStart,
              endTime: "18:00",
            },
          ],
        };
      })
    );
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    setSchedules((previous) =>
      previous.map((day) => {
        if (day.dayOfWeek !== dayIndex) return day;

        return {
          ...day,
          timeSlots: day.timeSlots.filter(
            (_, index) => index !== slotIndex
          ),
        };
      })
    );
  };

  // ==========================================
  // VALIDATE WORKING HOURS
  // ==========================================

  const validateDay = (day) => {
    if (!day.isOpen) return "";

    if (!day.timeSlots.length) {
      return "Add at least one working time slot.";
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    const sortedSlots = [...day.timeSlots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    for (const slot of sortedSlots) {
      if (
        !timePattern.test(slot.startTime) ||
        !timePattern.test(slot.endTime)
      ) {
        return "Please enter valid times in HH:mm format.";
      }

      if (slot.startTime >= slot.endTime) {
        return "Slot end time must be later than its start time.";
      }
    }

    for (let index = 1; index < sortedSlots.length; index++) {
      if (
        sortedSlots[index].startTime <
        sortedSlots[index - 1].endTime
      ) {
        return "Working time slots cannot overlap.";
      }
    }

    if (Boolean(day.breakStart) !== Boolean(day.breakEnd)) {
      return "Enter both break start and break end times.";
    }

    if (
      day.breakStart &&
      (!timePattern.test(day.breakStart) ||
        !timePattern.test(day.breakEnd) ||
        day.breakStart >= day.breakEnd)
    ) {
      return "Please enter a valid break time.";
    }

    return "";
  };

  // ==========================================
  // SAVE ONE DAY
  // ==========================================

  const saveDay = async (day) => {
    const validationError = validateDay(day);

    if (validationError) {
      setError(`${DAYS[day.dayOfWeek]}: ${validationError}`);
      setSuccess("");
      return;
    }

    setSavingDay(day.dayOfWeek);
    setError("");
    setSuccess("");

    try {
      const payload = {
        staff:
          selectedStaff === "business" ? null : selectedStaff,
        dayOfWeek: day.dayOfWeek,
        isOpen: day.isOpen,
        timeSlots: day.isOpen ? day.timeSlots : [],
        breakStart: day.breakStart || "",
        breakEnd: day.breakEnd || "",
        notes: day.notes || "",
      };

      await api.post("/schedules/working-hours", payload);

      setSuccess(`${DAYS[day.dayOfWeek]} schedule saved successfully.`);

      await loadScheduleData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingDay(null);
    }
  };

  // ==========================================
  // SAVE ALL DAYS
  // ==========================================

  const saveAllDays = async () => {
    for (const day of schedules) {
      const validationError = validateDay(day);

      if (validationError) {
        setError(`${DAYS[day.dayOfWeek]}: ${validationError}`);
        setSuccess("");
        return;
      }
    }

    setSavingAll(true);
    setError("");
    setSuccess("");

    try {
      const requests = schedules.map((day) =>
        api.post("/schedules/working-hours", {
          staff:
            selectedStaff === "business" ? null : selectedStaff,
          dayOfWeek: day.dayOfWeek,
          isOpen: day.isOpen,
          timeSlots: day.isOpen ? day.timeSlots : [],
          breakStart: day.breakStart || "",
          breakEnd: day.breakEnd || "",
          notes: day.notes || "",
        })
      );

      await Promise.all(requests);

      setSuccess("All weekly working hours saved successfully.");

      await loadScheduleData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingAll(false);
    }
  };

  // ==========================================
  // DELETE WORKING HOURS RECORD
  // ==========================================

  const deleteDay = async (day) => {
    if (!day._id) {
      setError("No saved schedule exists for this day.");
      return;
    }

    const confirmed = window.confirm(
      `Delete the saved ${DAYS[day.dayOfWeek]} schedule?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/schedules/working-hours/${day._id}`);

      setSuccess(`${DAYS[day.dayOfWeek]} schedule deleted.`);

      await loadScheduleData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // ==========================================
  // HOLIDAY FORM HANDLERS
  // ==========================================

  const handleHolidayChange = (event) => {
    const { name, value, type, checked } = event.target;

    setHolidayForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetHolidayForm = () => {
    setHolidayForm(createEmptyHoliday());
    setEditingHolidayId(null);
  };

  // ==========================================
  // CREATE / UPDATE HOLIDAY
  // ==========================================

  const handleHolidaySubmit = async (event) => {
    event.preventDefault();

    if (!holidayForm.name.trim()) {
      setError("Please enter a holiday name.");
      return;
    }

    if (!holidayForm.date) {
      setError("Please select a holiday date.");
      return;
    }

    if (
      holidayForm.endDate &&
      holidayForm.endDate < holidayForm.date
    ) {
      setError("Holiday end date cannot be before its start date.");
      return;
    }

    setSavingHoliday(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...holidayForm,
        name: holidayForm.name.trim(),
        endDate: holidayForm.endDate || null,
        staff:
          selectedStaff === "business"
            ? null
            : selectedStaff,
      };

      if (editingHolidayId) {
        await api.patch(
          `/schedules/holidays/${editingHolidayId}`,
          payload
        );

        setSuccess("Holiday updated successfully.");
      } else {
        await api.post("/schedules/holidays", payload);

        setSuccess("Holiday created successfully.");
      }

      resetHolidayForm();

      await loadScheduleData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingHoliday(false);
    }
  };

  // ==========================================
  // EDIT HOLIDAY
  // ==========================================

  const editHoliday = (holiday) => {
    setEditingHolidayId(holiday._id);

    setHolidayForm({
      name: holiday.name || "",
      date: formatDateInput(holiday.date),
      endDate: formatDateInput(holiday.endDate),
      staff: holiday.staff?._id || holiday.staff || "",
      type: holiday.type || "public_holiday",
      description: holiday.description || "",
      isRecurring: Boolean(holiday.isRecurring),
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE HOLIDAY
  // ==========================================

  const deleteHoliday = async (holidayId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this holiday?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/schedules/holidays/${holidayId}`);

      setSuccess("Holiday deleted successfully.");

      if (editingHolidayId === holidayId) {
        resetHolidayForm();
      }

      await loadScheduleData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="container-fluid py-3 py-md-4">

      {/* PAGE HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">
            <i className="bi bi-calendar-week me-2 text-primary"></i>
            Schedule Management
          </h3>

          <p className="text-muted mb-0">
            Manage weekly working hours, staff schedules and holidays.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadScheduleData}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="bi bi-check-circle me-2"></i>
          {success}

          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess("")}
          ></button>
        </div>
      )}

      {/* STAFF SELECTOR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-md-4">
          <label className="form-label fw-semibold">
            <i className="bi bi-person-workspace me-2 text-primary"></i>
            Configure Schedule For
          </label>

          <select
            className="form-select"
            value={selectedStaff}
            onChange={(event) => {
              setSelectedStaff(event.target.value);
              resetHolidayForm();
            }}
          >
            <option value="business">
              Business / Entire Clinic or Salon
            </option>

            {staffList.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name} {person.role ? `— ${person.role}` : ""}
              </option>
            ))}
          </select>

          <small className="text-muted d-block mt-2">
            Business schedules apply to the entire business.
            Individual staff schedules can be configured separately.
          </small>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="text-muted mt-3 mb-0">
            Loading schedule information...
          </p>
        </div>
      ) : (
        <>
          {/* ==================================
              WORKING HOURS
          ================================== */}

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-1">
                <i className="bi bi-clock-history me-2 text-primary"></i>
                Weekly Working Hours
              </h5>

              <p className="text-muted small mb-0">
                Configure available days and time slots.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAllDays}
              disabled={savingAll || savingDay !== null}
            >
              {savingAll ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  Save All Days
                </>
              )}
            </button>
          </div>

          <div className="row g-3 mb-5">
            {schedules.map((day) => (
              <div
                className="col-12 col-xl-6"
                key={day.dayOfWeek}
              >
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body p-3 p-md-4">

                    {/* DAY HEADER */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">
                          {DAYS[day.dayOfWeek]}
                        </h6>

                        <span
                          className={`badge ${
                            day.isOpen
                              ? "bg-success-subtle text-success"
                              : "bg-secondary-subtle text-secondary"
                          }`}
                        >
                          {day.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>

                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`open-${day.dayOfWeek}`}
                          checked={day.isOpen}
                          onChange={(event) =>
                            updateDay(
                              day.dayOfWeek,
                              "isOpen",
                              event.target.checked
                            )
                          }
                        />

                        <label
                          className="form-check-label small"
                          htmlFor={`open-${day.dayOfWeek}`}
                        >
                          Open
                        </label>
                      </div>
                    </div>

                    {day.isOpen ? (
                      <>
                        {/* TIME SLOTS */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label fw-semibold mb-0">
                            Working Time Slots
                          </label>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => addTimeSlot(day.dayOfWeek)}
                          >
                            <i className="bi bi-plus-lg me-1"></i>
                            Add Slot
                          </button>
                        </div>

                        {day.timeSlots.map((slot, slotIndex) => (
                          <div
                            className="row g-2 align-items-end mb-2"
                            key={slotIndex}
                          >
                            <div className="col-5">
                              <label className="form-label small text-muted">
                                Start Time
                              </label>

                              <input
                                type="time"
                                className="form-control"
                                value={slot.startTime}
                                onChange={(event) =>
                                  updateTimeSlot(
                                    day.dayOfWeek,
                                    slotIndex,
                                    "startTime",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="col-5">
                              <label className="form-label small text-muted">
                                End Time
                              </label>

                              <input
                                type="time"
                                className="form-control"
                                value={slot.endTime}
                                onChange={(event) =>
                                  updateTimeSlot(
                                    day.dayOfWeek,
                                    slotIndex,
                                    "endTime",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="col-2">
                              <button
                                type="button"
                                className="btn btn-outline-danger w-100"
                                title="Remove time slot"
                                onClick={() =>
                                  removeTimeSlot(
                                    day.dayOfWeek,
                                    slotIndex
                                  )
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* BREAK TIME */}
                        <div className="border-top pt-3 mt-3">
                          <label className="form-label fw-semibold">
                            <i className="bi bi-cup-hot me-2 text-warning"></i>
                            Break Time
                          </label>

                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label small text-muted">
                                Break Start
                              </label>

                              <input
                                type="time"
                                className="form-control"
                                value={day.breakStart}
                                onChange={(event) =>
                                  updateDay(
                                    day.dayOfWeek,
                                    "breakStart",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="col-6">
                              <label className="form-label small text-muted">
                                Break End
                              </label>

                              <input
                                type="time"
                                className="form-control"
                                value={day.breakEnd}
                                onChange={(event) =>
                                  updateDay(
                                    day.dayOfWeek,
                                    "breakEnd",
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="alert alert-light border text-muted small">
                        <i className="bi bi-moon me-2"></i>
                        This day is marked as closed.
                      </div>
                    )}

                    {/* NOTES */}
                    <div className="mt-3">
                      <label className="form-label fw-semibold">
                        Notes
                      </label>

                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Optional schedule notes..."
                        value={day.notes}
                        onChange={(event) =>
                          updateDay(
                            day.dayOfWeek,
                            "notes",
                            event.target.value
                          )
                        }
                      ></textarea>
                    </div>

                    {/* ACTIONS */}
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteDay(day)}
                        disabled={!day._id}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete Saved
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => saveDay(day)}
                        disabled={
                          savingAll ||
                          savingDay === day.dayOfWeek
                        }
                      >
                        {savingDay === day.dayOfWeek ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Saving
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-lg me-1"></i>
                            Save Day
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ==================================
              HOLIDAY MANAGEMENT
          ================================== */}

          <div className="mb-3">
            <h5 className="fw-bold mb-1">
              <i className="bi bi-calendar-x me-2 text-danger"></i>
              Holiday Management
            </h5>

            <p className="text-muted small mb-0">
              Create and manage public holidays, business closures,
              and staff leave.
            </p>
          </div>

          {/* HOLIDAY FORM */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-3 p-md-4">
              <h6 className="fw-bold mb-3">
                {editingHolidayId ? "Edit Holiday" : "Add New Holiday"}
              </h6>

              <form onSubmit={handleHolidaySubmit}>
                <div className="row g-3">

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">
                      Holiday Name *
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Example: Durga Puja"
                      maxLength="150"
                      value={holidayForm.name}
                      onChange={handleHolidayChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">
                      Holiday Type
                    </label>

                    <select
                      className="form-select"
                      name="type"
                      value={holidayForm.type}
                      onChange={handleHolidayChange}
                    >
                      {HOLIDAY_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={holidayForm.date}
                      onChange={handleHolidayChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      className="form-control"
                      value={holidayForm.endDate}
                      min={holidayForm.date || undefined}
                      onChange={handleHolidayChange}
                    />

                    <small className="text-muted">
                      Leave blank for a single-day holiday.
                    </small>
                  </div>

                  {selectedStaff === "business" && (
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Apply Holiday To
                      </label>

                      <select
                        className="form-select"
                        name="staff"
                        value={holidayForm.staff}
                        onChange={handleHolidayChange}
                      >
                        <option value="">
                          Entire Business
                        </option>

                        {staffList.map((person) => (
                          <option
                            key={person._id}
                            value={person._id}
                          >
                            {person.name} {person.role ? `— ${person.role}` : ""}
                          </option>
                        ))}
                      </select>

                      <small className="text-muted">
                        Choose an individual staff member or leave
                        this empty for a business-wide holiday.
                      </small>
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      name="description"
                      className="form-control"
                      rows="3"
                      maxLength="1000"
                      placeholder="Optional holiday details..."
                      value={holidayForm.description}
                      onChange={handleHolidayChange}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={holidayForm.isRecurring}
                        onChange={handleHolidayChange}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="isRecurring"
                      >
                        Repeat this holiday every year
                      </label>
                    </div>
                  </div>

                  <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingHoliday}
                    >
                      {savingHoliday ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          {editingHolidayId
                            ? "Update Holiday"
                            : "Add Holiday"}
                        </>
                      )}
                    </button>

                    {editingHolidayId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetHolidayForm}
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                </div>
              </form>
            </div>
          </div>

          {/* HOLIDAY TABLE */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4">

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  Saved Holidays
                </h6>

                <span className="badge bg-primary-subtle text-primary">
                  {holidays.length} Holidays
                </span>
              </div>

              {holidays.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-calendar2-check display-5 text-muted"></i>

                  <h6 className="fw-bold mt-3">
                    No Holidays Found
                  </h6>

                  <p className="text-muted small mb-0">
                    Add your first holiday using the form above.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Holiday</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Assigned To</th>
                        <th>Recurring</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {holidays.map((holiday) => {
                        const holidayStaff =
                          typeof holiday.staff === "object"
                            ? holiday.staff?.name
                            : staffList.find(
                                (person) =>
                                  person._id === holiday.staff
                              )?.name;

                        const holidayType = HOLIDAY_TYPES.find(
                          (type) => type.value === holiday.type
                        );

                        return (
                          <tr key={holiday._id}>
                            <td>
                              <div className="fw-semibold">
                                {holiday.name}
                              </div>

                              {holiday.description && (
                                <small className="text-muted">
                                  {holiday.description}
                                </small>
                              )}
                            </td>

                            <td>
                              <div>{formatDate(holiday.date)}</div>

                              {holiday.endDate && (
                                <small className="text-muted">
                                  To {formatDate(holiday.endDate)}
                                </small>
                              )}
                            </td>

                            <td>
                              <span className="badge bg-info-subtle text-info-emphasis">
                                {holidayType?.label || holiday.type}
                              </span>
                            </td>

                            <td>
                              {holidayStaff || "Entire Business"}
                            </td>

                            <td>
                              {holiday.isRecurring ? (
                                <span className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Yes
                                </span>
                              ) : (
                                <span className="text-muted">No</span>
                              )}
                            </td>

                            <td>
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  title="Edit holiday"
                                  onClick={() => editHoliday(holiday)}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete holiday"
                                  onClick={() =>
                                    deleteHoliday(holiday._id)
                                  }
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
