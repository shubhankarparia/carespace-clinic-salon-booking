
import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  show,
  title = "Are you sure?",
  message = "Do you want to continue with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel
}) {
  const icon = variant === "danger"
    ? "bi-exclamation-triangle"
    : variant === "success"
    ? "bi-check-circle"
    : "bi-question-circle";

  return (
    <Modal
      show={show}
      onClose={onCancel}
      title={title}
      size="sm"
      closeButton={!loading}
      footer={
        <div className="common-dialog-actions">
          <button
            type="button"
            className="common-btn common-btn-light common-btn-md"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`common-btn ${
              variant === "danger"
                ? "common-btn-danger"
                : "common-btn-primary"
            } common-btn-md`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Processing...
              </>
            ) : confirmText}
          </button>
        </div>
      }
    >
      <div className="common-confirm-content">
        <div className={`common-confirm-icon ${variant}`}>
          <i className={`bi ${icon}`} />
        </div>

        <p>{message}</p>
      </div>
    </Modal>
  );
}
