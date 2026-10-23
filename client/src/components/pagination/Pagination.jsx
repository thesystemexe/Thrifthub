import React from "react";
import "./pagination.css";
import { useSelector } from "react-redux";

const Pagination = ({
  currentPage,
  onPageChange,
  activeClass = "active",
  nextPageText = "Next",
  prevPageText = "Previous",
  firstPageText = "1",
  lastPageText = "Last",
  storeKey = "product",
}) => {
  const { products, totalPages } = useSelector((state) => state[storeKey]);

  if (products.length === 0 || totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pageNumbers = [];
    const pageWindow = 2;

    const startPage = Math.max(1, currentPage - pageWindow);
    const endPage = Math.min(totalPages, currentPage + pageWindow);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="th-pagination">
      {/* First + Previous */}

      {currentPage > 1 && (
        <>
          <button className="th-page-btn" onClick={() => onPageChange(1)}>
            {firstPageText}
          </button>

          <button
            className="th-page-btn"
            onClick={() => onPageChange(currentPage - 1)}
          >
            {prevPageText}
          </button>
        </>
      )}

      {/* Page Numbers */}

      {getPageNumbers().map((number) => (
        <button
          key={number}
          className={`th-page-btn ${currentPage === number ? activeClass : ""}`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}

      {/* Next + Last */}

      {currentPage < totalPages && (
        <>
          <button
            className="th-page-btn"
            onClick={() => onPageChange(currentPage + 1)}
          >
            {nextPageText}
          </button>

          <button
            className="th-page-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {lastPageText}
          </button>
        </>
      )}
    </div>
  );
};

export default Pagination;
