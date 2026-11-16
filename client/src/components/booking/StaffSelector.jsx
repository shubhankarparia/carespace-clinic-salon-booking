import React from "react";

export default function StaffSelector({
  staff = [],
  value,
  onChange,
  loading = false
}) {
  if (loading) {
    return (
      <div className="booking-inline-state">
        Loading professionals...
      </div>
    );
  }

  if (!staff.length) {
    return (
      <div className="booking-empty">
        No professionals available.
      </div>
    );
  }

  return (
    <div className="booking-staff-grid">
      {staff.map((person) => {
        const id = person._id || person.id;

        return (
          <button
            type="button"
            key={id}
            className={`booking-staff-card ${
              value === id ? "selected" : ""
            }`}
            onClick={() => onChange(id)}
          >
            <img
              src={
                person.image ||
                "https://placehold.co/96x96/eaf1ff/3157a4?text=Team"
              }
              alt={person.name}
            />

            <span className="booking-staff-info">
              <strong>{person.name}</strong>

              <small>
                {person.specialization || person.role || "Professional"}
              </small>
            </span>

            <i className={`bi ${
              value === id
                ? "bi-check-circle-fill"
                : "bi-circle"
            }`}></i>
          </button>
        );
      })}
    </div>
  );
}