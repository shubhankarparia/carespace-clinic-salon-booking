
import React, { useEffect } from "react";
import "./common.css";

export default function Modal({
  show = false,
  title,
  children,
  footer,
  onClose,
  size = "md",
  closeButton = true,
  closeOnBackdrop = true
}) {
  useEffect(() => {
    if (!show) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [show, onClose]);

  if (!show) return null;

  const handleBackdropClick = (event) => {
    if (
      closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      onClose?.();
    }
  };

  return (
    <div
      className="common-modal-backdrop"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className={`common-modal-dialog common-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="common-modal-title"
      >
        <div className="common-modal-header">

          <h2 id="common-modal-title">
            {title || "Information"}
          </h2>

          {closeButton && (
            <button
              type="button"
              className="common-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}

        </div>

        <div className="common-modal-body">
          {children}
        </div>

        {footer && (
          <div className="common-modal-footer">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}
