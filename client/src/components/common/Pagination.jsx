
import React from "react";
import "./common.css";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisible = 5
}) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safeCurrent = Math.min(
    safeTotal,
    Math.max(1, Number(currentPage) || 1)
  );

  const getPages = () => {
    const pages = [];

    let start = Math.max(
      1,
      safeCurrent - Math.floor(maxVisible / 2)
    );

    let end = Math.min(
      safeTotal,
      start + maxVisible - 1
    );

    start = Math.max(1, end - maxVisible + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  };

  const changePage = (page) => {
    if (page < 1 || page > safeTotal || page === safeCurrent) {
      return;
    }

    onPageChange?.(page);
  };

  if (safeTotal <= 1) return null;

  return (
    <nav
      className="common-pagination"
      aria-label="Pagination navigation"
    >
      <button
        type="button"
        className="common-pagination-btn"
        onClick={() => changePage(safeCurrent - 1)}
        disabled={safeCurrent === 1}
        aria-label="Previous page"
      >
        <i className="bi bi-chevron-left" />
      </button>

      {getPages().map((page) => (
        <button
          type="button"
          key={page}
          className={`common-pagination-btn ${
            page === safeCurrent ? "active" : ""
          }`}
          onClick={() => changePage(page)}
          aria-current={page === safeCurrent ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="common-pagination-btn"
        onClick={() => changePage(safeCurrent + 1)}
        disabled={safeCurrent === safeTotal}
        aria-label="Next page"
      >
        <i className="bi bi-chevron-right" />
      </button>
    </nav>
  );
}
