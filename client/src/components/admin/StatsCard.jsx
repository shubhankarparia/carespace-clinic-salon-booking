
import React from "react";

function StatsCard({
  title = "Total",
  value = 0,
  icon = "bi-bar-chart",
  color = "primary",
  subtitle = "",
  trend = null,
  onClick
}) {
  const colorClasses = {
    primary: "stats-primary",
    success: "stats-success",
    warning: "stats-warning",
    danger: "stats-danger",
    info: "stats-info",
    purple: "stats-purple"
  };

  const cardClass = colorClasses[color] || colorClasses.primary;

  const content = (
    <div className={`card border-0 shadow-sm rounded-4 h-100 stats-card ${cardClass}`}>
      <div className="card-body p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small fw-semibold mb-2">
              {title}
            </p>

            <h3 className="fw-bold mb-1">
              {value}
            </h3>

            {subtitle && (
              <small className="text-muted">
                {subtitle}
              </small>
            )}
          </div>

          <div className="stats-icon">
            <i className={`bi ${icon}`}></i>
          </div>
        </div>

        {trend !== null && (
          <div className="mt-3 small">
            <span
              className={
                Number(trend) >= 0
                  ? "text-success fw-semibold"
                  : "text-danger fw-semibold"
              }
            >
              <i
                className={`bi ${
                  Number(trend) >= 0
                    ? "bi-arrow-up-right"
                    : "bi-arrow-down-right"
                } me-1`}
              />
              {Math.abs(Number(trend))}%
            </span>

            <span className="text-muted ms-1">
              compared to last period
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className="stats-card-button text-start w-100 border-0 bg-transparent p-0"
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return content;
}

export default StatsCard;
