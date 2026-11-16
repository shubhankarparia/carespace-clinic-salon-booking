
import React from "react";
import "./common.css";

export default function SectionTitle({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  className = ""
}) {
  return (
    <div
      className={`common-section-title text-${align} ${className}`}
    >
      {eyebrow && (
        <span className="common-section-eyebrow">
          <span className="common-section-eyebrow-dot" />
          {eyebrow}
        </span>
      )}

      <h2>
        {title}{" "}
        {highlight && (
          <span className="common-section-highlight">
            {highlight}
          </span>
        )}
      </h2>

      {description && (
        <p>{description}</p>
      )}

      <div className={`common-section-line ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
