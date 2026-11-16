import React from "react";

const categories = [
  {
    id: "clinic",
    title: "Clinic",
    subtitle: "Doctor consultations & healthcare",
    icon: "bi-heart-pulse",
    color: "blue"
  },
  {
    id: "salon",
    title: "Salon",
    subtitle: "Hair, beauty & personal care",
    icon: "bi-scissors",
    color: "pink"
  }
];

export default function CategorySelector({ value, onChange }) {
  return (
    <div className="booking-choice-grid">
      {categories.map((item) => (
        <button
          type="button"
          key={item.id}
          className={`booking-choice-card ${
            value === item.id ? "selected" : ""
          }`}
          onClick={() => onChange(item.id)}
        >
          <span className={`booking-choice-icon ${item.color}`}>
            <i className={`bi ${item.icon}`}></i>
          </span>

          <span className="booking-choice-copy">
            <strong>{item.title}</strong>
            <small>{item.subtitle}</small>
          </span>

          <i className={`bi ${
            value === item.id
              ? "bi-check-circle-fill"
              : "bi-circle"
          } booking-choice-check`}></i>
        </button>
      ))}
    </div>
  );
}