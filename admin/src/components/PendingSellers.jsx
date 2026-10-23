import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Search,
  Store,
  MapPin,
  Eye,
  Clock3,
  Users,
  RefreshCw,
} from "lucide-react";

import { fetchPendingVerifications } from "../features/admin/adminSlice";

import Pagination from "../components/pagination/Pagination";

import "../styles/pendingSellers.css";

const PendingSellers = () => {
  const dispatch = useDispatch();

  const {
    pendingSellers,
    totalCount,
    totalPages,
    currentPage,
    resultPerPage,
    sellerLoading,
    error,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");

  /*
    Fetch sellers whenever:
    - page changes
    - search changes
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchPendingVerifications({
          page: currentPage,
          keyword: search,
        }),
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, currentPage, search]);

  console.log(pendingSellers);

  /*
    Search starts from page 1.
    This prevents situations like:
    
    Page 4 + search "vintage"
    
    when the search only has 1 page.
  */
  const handleSearch = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (currentPage !== 1) {
      dispatch(
        fetchPendingVerifications({
          page: 1,
          keyword: value,
        }),
      );
    }
  };

  /*
    Pagination
  */
  const handlePageChange = (page) => {
    if (page === currentPage) return;

    dispatch(
      fetchPendingVerifications({
        page,
        keyword: search,
      }),
    );
  };

  /*
    Refresh current page
  */
  const handleRefresh = () => {
    dispatch(
      fetchPendingVerifications({
        page: currentPage,
        keyword: search,
      }),
    );
  };

  /*
    Format location
  */
  const getLocation = (seller) => {
    if (seller.businessAddress) {
      const city = seller.businessAddress.city || "";

      const state = seller.businessAddress.state || "";

      if (city && state) {
        return `${city}, ${state}`;
      }

      return city || state || null;
    }

    return seller.location || null;
  };

  /*
    Format date
  */
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="seller-verification-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="verification-header">
        <div className="verification-heading">
          <span className="verification-eyebrow">Seller Management</span>

          <h1>Pending Sellers</h1>

          <p>Review merchant applications waiting for verification.</p>
        </div>

        <div className="verification-summary">
          <div className="verification-summary-icon">
            <Users size={17} strokeWidth={1.8} />
          </div>

          <div>
            <span className="verification-summary-label">
              Pending Applications
            </span>

            <strong>{totalCount}</strong>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <section className="verification-controls">
        <div className="verification-search">
          <Search
            size={17}
            strokeWidth={1.8}
            className="verification-search-icon"
          />

          <input
            type="text"
            placeholder="Search by store or seller name..."
            value={search}
            onChange={handleSearch}
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
          disabled={sellerLoading}
        >
          <RefreshCw
            size={15}
            strokeWidth={1.8}
            className={sellerLoading ? "refresh-spinning" : ""}
          />

          <span>Refresh</span>
        </button>
      </section>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <section className="seller-table-card">
        {/* TABLE HEADER */}

        <div className="table-card-header">
          <div>
            <span className="table-eyebrow">Verification Queue</span>

            <h2>Seller Applications</h2>
          </div>

          <div className="pending-label">
            <Clock3 size={13} strokeWidth={1.8} />

            <span>Pending review</span>
          </div>
        </div>

        {/* ===================================================
            sellerLoading
        =================================================== */}

        {sellerLoading ? (
          <div className="verification-state">
            <div className="state-icon sellerLoading-icon">
              <RefreshCw size={20} className="refresh-spinning" />
            </div>

            <h3>sellerLoading applications</h3>

            <p>Fetching the latest seller verification requests.</p>
          </div>
        ) : error ? (
          /* =================================================
             ERROR
          ================================================= */

          <div className="verification-state">
            <div className="state-icon">
              <Store size={20} strokeWidth={1.8} />
            </div>

            <h3>Unable to load applications</h3>

            <p>{error}</p>

            <button
              type="button"
              className="retry-button"
              onClick={handleRefresh}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : pendingSellers.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="verification-state">
            <div className="state-icon">
              <Store size={21} strokeWidth={1.7} />
            </div>

            <h3>
              {search ? "No applications found" : "No pending applications"}
            </h3>

            <p>
              {search
                ? "Try searching with another store or seller name."
                : "All seller applications have been reviewed."}
            </p>

            {search && (
              <button
                type="button"
                className="retry-button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="seller-table-wrapper">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Store / Merchant</th>

                  <th>Location</th>

                  <th>Status</th>

                  <th>Applied On</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {pendingSellers.map((seller) => {
                  const storeName =
                    seller.storeName || seller.companyName || "Unnamed Store";

                  const sellerName =
                    seller.ownerName ||
                    seller.user?.username ||
                    seller.user?.name ||
                    "Merchant";

                  const location = getLocation(seller);

                  return (
                    <tr key={seller._id}>
                      {/* STORE */}

                      <td>
                        <div className="store-cell">
                          <div className="store-avatar">
                            <Store size={17} strokeWidth={1.8} />
                          </div>

                          <div className="store-info">
                            <span className="store-name">{storeName}</span>

                            <span className="seller-name">{sellerName}</span>
                          </div>
                        </div>
                      </td>

                      {/* LOCATION */}

                      <td>
                        {location ? (
                          <div className="location-cell">
                            <MapPin size={14} strokeWidth={1.8} />

                            <span>{location}</span>
                          </div>
                        ) : (
                          <span className="muted-value">Not provided</span>
                        )}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span className="pending-status">
                          <span className="pending-status-dot" />
                          Pending
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="application-date">
                          {formatDate(seller.createdAt)}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td>
                        <Link
                          to={`/seller/${seller._id}`}
                          className="view-seller-link"
                        >
                          <Eye size={14} strokeWidth={1.8} />

                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ===================================================
            FOOTER / PAGINATION
        =================================================== */}

        {!sellerLoading && !error && pendingSellers.length > 0 && (
          <div className="table-card-footer">
            <div className="table-result-info">
              Showing <strong>{(currentPage - 1) * resultPerPage + 1}</strong> –{" "}
              <strong>
                {Math.min(currentPage * resultPerPage, totalCount)}
              </strong>{" "}
              of <strong>{totalCount}</strong> applications
            </div>

            <Pagination
              currentPage={currentPage}
              storeKey="admin"
              dataKey="pendingSellers"
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default PendingSellers;
