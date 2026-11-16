import React from "react";

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = []
}) {
  const today = new Date().toLocaleDateString("en-CA");

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    if (disabledDates.includes(selectedDate)) {
      alert("This date is unavailable. Please select another date.");
      return;
    }

    onChange(selectedDate);
  };

  return (
    <div className="booking-field">
      <label className="form-label fw-semibold">
        Choose appointment date
      </label>

      <div className="booking-date-control">
        <i className="bi bi-calendar3"></i>

        <input
          type="date"
          className="form-control"
          value={value || ""}
          min={minDate || today}
          max={maxDate}
          onChange={handleDateChange}
        />
      </div>

      <small className="booking-help">
        Select your preferred appointment date.
      </small>
    </div>
  );
}