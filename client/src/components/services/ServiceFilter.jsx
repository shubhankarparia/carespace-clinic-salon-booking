
import React, { useState } from "react";

export default function ServiceFilter({
  onFilter,
  categories = ["all", "clinic", "salon"],
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const handleChange = (newSearch, newCategory) => {
    if (onFilter) {
      onFilter({
        search: newSearch,
        category: newCategory,
      });
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    handleChange(value, category);
  };

  const handleCategory = (value) => {
    setCategory(value);
    handleChange(search, value);
  };

  return (
    <div className="service-filter bg-white rounded-4 shadow-sm p-3 p-md-4 mb-4">
      <div className="row g-3 align-items-center">
        <div className="col-lg-6">
          <label className="form-label fw-semibold">
            Search Services
          </label>

          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search" />
            </span>

            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search haircut, consultation, facial..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-6">
          <label className="form-label fw-semibold">
            Filter by Category
          </label>

          <select
            className="form-select"
            value={category}
            onChange={(e) => handleCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all"
                  ? "All Services"
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(search || category !== "all") && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Active filters applied
          </small>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              setSearch("");
              setCategory("all");
              handleChange("", "all");
            }}
          >
            <i className="bi bi-x-circle me-1" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
