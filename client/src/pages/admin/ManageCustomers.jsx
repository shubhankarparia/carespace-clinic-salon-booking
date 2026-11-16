
import React from "react";
import AdminCrud from "./AdminCrud";

export default function ManageCustomers() {
  return (
    <AdminCrud
      title="Customers"
      subtitle="View and manage registered customers."
      endpoint="/admin/customers"
      icon="bi-people"
      canAdd={false}
      canEdit={false}
      columns={[
        {
          key: "name",
          label: "Customer Name",
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
          key: "createdAt",
          label: "Registered",
          render: (row) =>
            row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("en-IN")
              : "—",
        },
      ]}
    />
  );
}
