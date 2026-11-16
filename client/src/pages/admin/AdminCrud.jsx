
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../../services/api";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  PageHeader,
  Panel,
  DataTable,
  SearchBox,
  ErrorMessage,
  FormField,
  getList,
  getError,
} from "./AdminComponents";

// Extract options from common API response formats.
const extractOptions = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.services)) return data.services;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return getList(response);
};

// Convert MongoDB references to ID strings.
const normalizeReference = (value) => {
  if (value && typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return value ? String(value) : "";
};

export default function AdminCrud({
  title,
  subtitle,
  endpoint,
  listEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  fields = [],
  columns = [],
  icon = "bi-grid",
  searchable = true,
  canAdd = true,
  canEdit = true,
  canDelete = true,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [dynamicOptions, setDynamicOptions] = useState({});
  const [optionsLoading, setOptionsLoading] = useState(false);

  // API endpoints
  const fetchUrl = listEndpoint || endpoint;
  const postUrl = createEndpoint || endpoint;

  const updateUrl = (id) =>
    `${updateEndpoint || endpoint}/${id}`;

  const deleteUrl = (id) =>
    `${deleteEndpoint || endpoint}/${id}`;

  // Generate empty form values.
  const emptyForm = useCallback(() => {
    return Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.defaultValue ??
          (field.type === "checkbox"
            ? false
            : field.type === "multiselect"
              ? []
              : ""),
      ])
    );
  }, [fields]);

  // Load records.
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(fetchUrl);
      setItems(getList(response));
    } catch (err) {
      setItems([]);
      setError(
        getError(err, `Unable to load ${title.toLowerCase()}.`)
      );
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, title]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Load dynamic dropdown options.
  const loadDynamicOptions = async () => {
    const dynamicFields = fields.filter(
      (field) => field.optionsEndpoint
    );

    if (!dynamicFields.length) return;

    setOptionsLoading(true);

    try {
      const results = await Promise.all(
        dynamicFields.map(async (field) => {
          const response = await api.get(field.optionsEndpoint);

          return {
            name: field.name,
            options: extractOptions(response),
          };
        })
      );

      const mappedOptions = {};

      results.forEach((result) => {
        mappedOptions[result.name] = result.options;
      });

      setDynamicOptions((previous) => ({
        ...previous,
        ...mappedOptions,
      }));
    } catch (err) {
      setError(
        getError(
          err,
          "Unable to load dropdown options. Please try again."
        )
      );
    } finally {
      setOptionsLoading(false);
    }
  };

  // Search records.
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;

    const query = search.toLowerCase();

    return items.filter((item) =>
      Object.values(item).some((value) => {
        const text =
          value && typeof value === "object"
            ? value.name || value.email || ""
            : value ?? "";

        return String(text).toLowerCase().includes(query);
      })
    );
  }, [items, search]);

  // Open Add modal.
  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);

    loadDynamicOptions();
  };

  // Open Edit modal.
  const openEdit = (item) => {
    setEditing(item);
    setError("");

    const values = {};

    fields.forEach((field) => {
      let value = item[field.name];

      if (field.type === "multiselect") {
        value = Array.isArray(value)
          ? value.map(normalizeReference).filter(Boolean)
          : [];
      } else if (Array.isArray(value)) {
        value = value.map(normalizeReference);
      } else if (value && typeof value === "object") {
        value = normalizeReference(value);
      }

      values[field.name] =
        value ??
        field.defaultValue ??
        (field.type === "checkbox"
          ? false
          : field.type === "multiselect"
            ? []
            : "");
    });

    setForm(values);
    setShowForm(true);

    loadDynamicOptions();
  };

  // Handle form changes.
  const handleChange = (event) => {
    const { name, value, type, checked, options, multiple } =
      event.target;

    let nextValue = value;

    if (type === "checkbox") {
      nextValue = checked;
    } else if (multiple) {
      nextValue = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
    }

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setError("");
  };

  // Prepare payload for backend.
  const preparePayload = () => {
    const payload = {};

    fields.forEach((field) => {
      const value = form[field.name];

      if (field.type === "checkbox") {
        payload[field.name] = Boolean(value);
      } else if (field.type === "multiselect") {
        payload[field.name] = Array.isArray(value)
          ? value.filter(Boolean)
          : [];
      } else if (field.type === "number") {
        payload[field.name] =
          value === "" ? 0 : Number(value);
      } else if (
        field.type === "textarea" ||
        field.type === "text" ||
        !field.type
      ) {
        payload[field.name] =
          typeof value === "string"
            ? value.trim()
            : value;
      } else {
        payload[field.name] = value;
      }
    });

    return payload;
  };

  // Save new or updated record.
  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = preparePayload();

      if (editing) {
        await api.patch(
          updateUrl(editing._id),
          payload
        );
      } else {
        await api.post(postUrl, payload);
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm());

      await loadItems();
    } catch (err) {
      const backendErrors = err.response?.data?.errors;

      if (Array.isArray(backendErrors) && backendErrors.length) {
        setError(backendErrors.join(" "));
      } else {
        setError(
          getError(err, "Unable to save record. Please check the form.")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete record.
  const handleDelete = async () => {
    if (!deleteItem || deleting) return;

    setDeleting(true);
    setError("");

    try {
      await api.delete(deleteUrl(deleteItem._id));

      setDeleteItem(null);
      await loadItems();
    } catch (err) {
      setError(
        getError(err, "Unable to delete record.")
      );
    } finally {
      setDeleting(false);
    }
  };

  // Render multiple-select field.
  const renderMultiSelect = (field) => {
    const allOptions =
      dynamicOptions[field.name] || field.options || [];

    const filteredOptions = field.filterByField
      ? allOptions.filter(
          (option) =>
            !form[field.filterByField] ||
            option[field.filterKey || "category"] ===
              form[field.filterByField]
        )
      : allOptions;

    const selectedValues = Array.isArray(form[field.name])
      ? form[field.name].map(String)
      : [];

    return (
      <div className="mb-3">
        <label
          className="form-label fw-semibold"
          htmlFor={field.name}
        >
          {field.label}
          {field.required && (
            <span className="text-danger ms-1">*</span>
          )}
        </label>

        <select
          id={field.name}
          name={field.name}
          className="form-select"
          multiple
          size={field.size || 5}
          value={selectedValues}
          onChange={handleChange}
          required={field.required}
          disabled={optionsLoading}
        >
          {filteredOptions.map((option) => {
            const optionValue = normalizeReference(
              option[field.valueKey || "_id"] ??
                option.id ??
                option.value
            );

            const optionLabel =
              option[field.labelKey || "name"] ||
              option.label ||
              option.title ||
              optionValue;

            return (
              <option
                key={optionValue}
                value={optionValue}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>

        <small className="text-muted d-block mt-2">
          {optionsLoading
            ? "Loading services..."
            : field.helpText ||
              "Hold Ctrl (Windows) or Command (Mac) to select multiple services."}
        </small>

        {filteredOptions.length === 0 && !optionsLoading && (
          <small className="text-danger d-block mt-1">
            No services found for this department.
          </small>
        )}

        {selectedValues.length > 0 && (
          <small className="text-primary d-block mt-2">
            {selectedValues.length} service(s) selected
          </small>
        )}
      </div>
    );
  };

  // Table actions.
  const actionColumn = {
    key: "actions",
    label: "Actions",
    render: (item) => (
      <div className="admin-table-actions">
        {canEdit && (
          <button
            type="button"
            className="admin-icon-action edit"
            title="Edit"
            onClick={() => openEdit(item)}
          >
            <i className="bi bi-pencil-square" />
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            className="admin-icon-action delete"
            title="Delete"
            onClick={() => setDeleteItem(item)}
          >
            <i className="bi bi-trash" />
          </button>
        )}
      </div>
    ),
  };

  const tableColumns = [
    ...columns,
    ...(canEdit || canDelete ? [actionColumn] : []),
  ];

  return (
    <div className="admin-page-content">
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        action={
          canAdd ? (
            <button
              type="button"
              className="btn btn-primary admin-action-btn"
              onClick={openAdd}
            >
              <i className="bi bi-plus-lg me-2" />
              Add New
            </button>
          ) : null
        }
      />

      <ErrorMessage
        message={error}
        onRetry={loadItems}
      />

      <Panel
        title={`All ${title}`}
        subtitle={`${filteredItems.length} record(s) found`}
        action={
          searchable ? (
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          ) : null
        }
      >
        <DataTable
          columns={tableColumns}
          rows={filteredItems}
          loading={loading}
          emptyMessage={`No ${title.toLowerCase()} found.`}
        />
      </Panel>

      {/* Add / Edit Modal */}
      <Modal
        show={showForm}
        onClose={() => !saving && setShowForm(false)}
        title={
          editing
            ? `Edit ${title.replace(/s$/, "")}`
            : `Add ${title.replace(/s$/, "")}`
        }
        size="lg"
        closeButton={!saving}
      >
        <form onSubmit={handleSave}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row">
            {fields.map((field) => (
              <div
                className={
                  field.fullWidth ? "col-12" : "col-md-6"
                }
                key={field.name}
              >
                {field.type === "checkbox" ? (
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      checked={Boolean(form[field.name])}
                      onChange={handleChange}
                    />

                    <label
                      className="form-check-label"
                      htmlFor={field.name}
                    >
                      {field.label}
                    </label>
                  </div>
                ) : field.type === "multiselect" ? (
                  renderMultiSelect(field)
                ) : (
                  <FormField
                    {...field}
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || optionsLoading}
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={Boolean(deleteItem)}
        title="Delete record?"
        message="This action will deactivate the record. Are you sure?"
        confirmText="Delete"
        loading={deleting}
        onCancel={() => !deleting && setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
