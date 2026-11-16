import React from "react";

export default function TimeSlotPicker({
  slots = [],
  value,
  onChange,
  loading = false
}) {
  if (loading) {
    return (
      <div className="booking-inline-state">
        Checking available time slots...
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="booking-empty">
        No available slots for this date.
      </div>
    );
  }

  return (
    <div className="booking-time-grid">
      {slots.map((slot) => {
        const time = typeof slot === "string" ? slot : slot.time;
        const available =
          typeof slot === "string" || slot.available !== false;

        return (
          <button
            type="button"
            key={time}
            disabled={!available}
            className={`booking-time-slot ${
              value === time ? "selected" : ""
            }`}
            onClick={() => onChange(time)}
          >
            {time}

            {!available && <small>Booked</small>}
          </button>
        );
      })}
    </div>
  );
}