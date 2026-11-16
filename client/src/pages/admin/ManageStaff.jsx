
import React from "react";

import AdminCrud from "./AdminCrud";
import { StatusBadge } from "./AdminComponents";

export default function ManageStaff() {
  return (
    <AdminCrud
      title="Staff"
      subtitle="Manage doctors, stylists and other professionals."
      endpoint="/staff"
      listEndpoint="/staff/admin/all"
      icon="bi-person-badge"

      // Staff management permissions
      canAdd={true}
      canEdit={true}
      canDelete={false}

      fields={[
        {
          name: "name",
          label: "Full Name",
          required: true,
          placeholder: "Enter full name",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "Enter email address",
        },
        {
          name: "phone",
          label: "Phone",
          type: "tel",
          required: true,
          placeholder: "Enter phone number",
        },
        {
          name: "category",
          label: "Department",
          required: true,
          options: [
            { value: "clinic", label: "Clinic" },
            { value: "salon", label: "Salon" },
          ],
        },
        {
          name: "role",
          label: "Staff Role",
          required: true,
          options: [
            { value: "Doctor", label: "Doctor" },
            { value: "Dentist", label: "Dentist" },
            { value: "Nurse", label: "Nurse" },
            {
              value: "Physiotherapist",
              label: "Physiotherapist",
            },
            {
              value: "Lab Technician",
              label: "Lab Technician",
            },
            {
              value: "Hair Stylist",
              label: "Hair Stylist",
            },
            {
              value: "Beautician",
              label: "Beautician",
            },
            {
              value: "Makeup Artist",
              label: "Makeup Artist",
            },
            {
              value: "Hair Therapist",
              label: "Hair Therapist",
            },
            {
              value: "Nail Technician",
              label: "Nail Technician",
            },
            {
              value: "Receptionist",
              label: "Receptionist",
            },
          ],
        },
        {
          name: "specialization",
          label: "Specialization",
          fullWidth: true,
          placeholder: "e.g. Cardiology / Hair Styling",
        },
        {
          name: "qualification",
          label: "Qualification",
          placeholder: "e.g. MBBS / Diploma",
        },
        {
          name: "experience",
          label: "Experience (Years)",
          type: "number",
          defaultValue: 0,
        },
        {
          name: "consultationFee",
          label: "Consultation Fee (₹)",
          type: "number",
          defaultValue: 0,
        },

        // Assign multiple services to this staff member.
        {
          name: "services",
          label: "Assign Services",
          type: "multiselect",
          optionsEndpoint: "/services",
          valueKey: "_id",
          labelKey: "name",
          filterByField: "category",
          filterKey: "category",
          fullWidth: true,
          defaultValue: [],
          helpText:
            "Select the services this professional can provide. Hold Ctrl to select multiple services.",
        },

        // Staff availability
        {
          name: "isAvailable",
          label: "Available for bookings",
          type: "checkbox",
          defaultValue: true,
        },

        // Staff active status
        {
          name: "isActive",
          label: "Active staff member",
          type: "checkbox",
          defaultValue: true,
        },
      ]}

      columns={[
        {
          key: "name",
          label: "Name",
        },
        {
          key: "role",
          label: "Staff Role",
        },
        {
          key: "email",
          label: "Email",
        },
        {
          key: "phone",
          label: "Phone",
        },
        {
          key: "category",
          label: "Department",
        },
        {
          key: "specialization",
          label: "Specialization",
        },
        {
          key: "services",
          label: "Assigned Services",
          render: (row) => {
            const services = Array.isArray(row.services)
              ? row.services
              : [];

            if (!services.length) {
              return (
                <span className="text-danger">
                  No services assigned
                </span>
              );
            }

            return (
              <div className="d-flex flex-wrap gap-1">
                {services.map((service, index) => (
                  <span
                    key={service._id || service.id || index}
                    className="badge bg-primary-subtle text-primary"
                  >
                    {service.name || "Service"}
                  </span>
                ))}
              </div>
            );
          },
        },
        {
          key: "isAvailable",
          label: "Availability",
          render: (row) => (
            <StatusBadge
              status={row.isAvailable ? "active" : "inactive"}
            />
          ),
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
