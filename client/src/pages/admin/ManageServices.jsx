
import React from "react";
import AdminCrud from "./AdminCrud";
import { StatusBadge } from "./AdminComponents";

export default function ManageServices() {
  return (
    <AdminCrud
      title="Services"
      subtitle="Manage clinic treatments and salon services."
      endpoint="/services"
      icon="bi-grid"

      fields={[
        {
          name: "name",
          label: "Service Name",
          type: "text",
          required: true,
          placeholder: "e.g. General Health Checkup",
        },
        {
          name: "slug",
          label: "Service Slug",
          type: "text",
          required: true,
          placeholder: "e.g. general-health-checkup",
        },
        {
          name: "category",
          label: "Category",
          required: true,
          options: [
            { value: "clinic", label: "Clinic" },
            { value: "salon", label: "Salon" },
          ],
        },
        {
          name: "price",
          label: "Price (₹)",
          type: "number",
          required: true,
          min: "0",
          placeholder: "Enter service price",
        },
        {
          name: "discountPrice",
          label: "Discount Price (₹)",
          type: "number",
          min: "0",
          placeholder: "Optional discount price",
        },
        {
          name: "duration",
          label: "Duration (minutes)",
          type: "number",
          required: true,
          min: "5",
          defaultValue: 30,
          placeholder: "Minimum 5 minutes",
        },
        {
          name: "preparationTime",
          label: "Preparation Time (minutes)",
          type: "number",
          min: "0",
          defaultValue: 0,
        },
        {
          name: "cleanupTime",
          label: "Cleanup Time (minutes)",
          type: "number",
          min: "0",
          defaultValue: 0,
        },
        {
          name: "shortDescription",
          label: "Short Description",
          type: "textarea",
          fullWidth: true,
          placeholder: "Write a short description...",
        },
        {
          name: "description",
          label: "Full Description",
          type: "textarea",
          required: true,
          fullWidth: true,
          placeholder: "Enter complete service description...",
        },
        {
          name: "isActive",
          label: "Active Service",
          type: "checkbox",
          defaultValue: true,
        },
      ]}

      columns={[
        {
          key: "name",
          label: "Service",
          render: (row) => (
            <div>
              <strong>{row.name || "—"}</strong>
              <div className="small text-muted">
                {row.slug || ""}
              </div>
            </div>
          ),
        },
        {
          key: "category",
          label: "Category",
          render: (row) => (
            <span
              className={`admin-category-tag ${row.category || ""}`}
            >
              {row.category || "—"}
            </span>
          ),
        },
        {
          key: "price",
          label: "Price",
          render: (row) => (
            <div>
              <strong>
                ₹{Number(row.price || 0).toLocaleString("en-IN")}
              </strong>

              {row.discountPrice > 0 && (
                <div className="small text-success">
                  Offer: ₹
                  {Number(row.discountPrice).toLocaleString("en-IN")}
                </div>
              )}
            </div>
          ),
        },
        {
          key: "duration",
          label: "Duration",
          render: (row) => `${row.duration || 0} min`,
        },
        {
          key: "isActive",
          label: "Status",
          render: (row) => (
            <StatusBadge
              status={row.isActive ? "active" : "inactive"}
            />
          ),
        },
      ]}
    />
  );
}
