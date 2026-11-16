
import React from "react";
import "./common.css";

export default function Loader({
  message = "Please wait...",
  fullScreen = false,
  size = "md",
  overlay = false
}) {
  return (
    <div
      className={[
        "common-loader",
        fullScreen ? "common-loader-fullscreen" : "",
        overlay ? "common-loader-overlay" : ""
      ].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className={`common-loader-spinner common-loader-${size}`} />

      {message && (
        <p className="common-loader-message">
          {message}
        </p>
      )}

      <span className="visually-hidden">Loading</span>
    </div>
  );
}
