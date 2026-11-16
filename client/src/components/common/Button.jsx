
import React from "react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  block = false,
  className = "",
  onClick,
  ...props
}) {
  const variantClasses = {
    primary: "common-btn-primary",
    secondary: "common-btn-secondary",
    outline: "common-btn-outline",
    danger: "common-btn-danger",
    success: "common-btn-success",
    light: "common-btn-light"
  };

  const sizeClasses = {
    sm: "common-btn-sm",
    md: "common-btn-md",
    lg: "common-btn-lg"
  };

  return (
    <button
      type={type}
      className={[
        "common-btn",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        block ? "common-btn-block" : "",
        className
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm"
            aria-hidden="true"
          />
          <span> Please wait...</span>
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
          {children}
        </>
      )}
    </button>
  );
}
