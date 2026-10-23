import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Search,
  Store,
  MapPin,
  Phone,
  CalendarDays,
  Eye,
  RefreshCw,
  CheckCircle2,
  Users,
} from "lucide-react";

import { fetchApprovedSellers } from "../features/admin/adminSlice";
import Pagination from "../components/pagination/Pagination";
import "../styles/approvedSellers.css";

const ApprovedSellers = () => {
  const dispatch = useDispatch();

  const {
    approvedSellers,
    totalCount,
    currentPage,
    resultPerPage,
    sellerLoading,
    error,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Fetch approved sellers
  // --------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchApprovedSellers({
          page: 1,
          keyword: search,
        }),
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, search]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------
  const handlePageChange = (page) => {
    if (page === currentPage) return;

    dispatch(
      fetchApprovedSellers({
        page,
        keyword: search,
      }),
    );
  };

  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------
  const handleRefresh = () => {
    dispatch(
      fetchApprovedSellers({
        page: currentPage,
        keyword: search,
      }),
    );
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // Get seller location
  // --------------------------------------------------
  const getLocation = (seller) => {
    const address = seller.businessAddress;

    if (!address) {
      return "N/A";
    }

    const parts = [address.city, address.state].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  // --------------------------------------------------
  // Get owner name
  // --------------------------------------------------
  const getOwnerName = (seller) => {
    if (!seller.user) {
      return "N/A";
    }

    if (typeof seller.user === "object") {
      return (
        seller.user.name ||
        seller.user.username ||
        seller.user.email ||
        "Registered User"
      );
    }

    return seller.ownerName || seller.user;
  };

  // --------------------------------------------------
  // Pagination result numbers
  // --------------------------------------------------
  const startItem =
    totalCount === 0 ? 0 : (currentPage - 1) * resultPerPage + 1;

  const endItem = Math.min(currentPage * resultPerPage, totalCount);

  return (
    <div className="approved-sellers-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="approved-header">
        <div className="approved-header-content">
          <span className="page-eyebrow">Seller Management</span>

          <h1>Approved Sellers</h1>

          <p>
            Manage and review sellers who are currently approved to operate on
            ThriftHub.
          </p>
        </div>

        <div className="approved-header-stat">
          <CheckCircle2 size={18} />

          <div>
            <span>Active Sellers</span>
            <strong>{totalCount}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="approved-toolbar">
        <div className="approved-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by store or seller name..."
            aria-label="Search approved sellers"
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={sellerLoading}
        >
          <RefreshCw size={15} className={sellerLoading ? "is-spinning" : ""} />

          <span>Refresh</span>
        </button>
      </div>

      {/* =====================================================
          ERROR STATE
      ===================================================== */}

      {error && (
        <div className="approved-error">
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          SELLER TABLE CARD
      ===================================================== */}

      <div className="approved-table-card">
        {/* TABLE HEADER */}

        <div className="table-top">
          <div>
            <span className="table-eyebrow">Merchant Directory</span>

            <h2>Approved Seller Accounts</h2>
          </div>

          <div className="table-count">
            <Users size={15} />

            <span>
              {totalCount} {totalCount === 1 ? "seller" : "sellers"}
            </span>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {sellerLoading ? (
          <div className="approved-sellerLoading">
            <div className="approved-spinner" />

            <p>Loading approved sellers...</p>
          </div>
        ) : error ? (
          /* =====================================================
              ERROR
          ===================================================== */

          <div className="approved-empty">
            <div className="empty-icon">
              <Store size={25} />
            </div>

            <h3>Unable to load sellers</h3>

            <p>{error}</p>

            <button type="button" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        ) : approvedSellers.length === 0 ? (
          /* =====================================================
              EMPTY
          ===================================================== */

          <div className="approved-empty">
            <div className="empty-icon">
              <Store size={25} />
            </div>

            <h3>{search ? "No sellers found" : "No approved sellers"}</h3>

            <p>
              {search
                ? "Try searching with a different store or seller name."
                : "There are currently no approved seller accounts."}
            </p>

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                TABLE
            ================================================= */}

            <div className="approved-table-wrapper">
              <table className="approved-table">
                <thead>
                  <tr>
                    <th>Seller / Store</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Approved On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {approvedSellers.map((seller) => (
                    <tr key={seller._id}>
                      {/* Seller / Store */}

                      <td>
                        <div className="seller-cell">
                          <div className="seller-store-icon">
                            <Store size={18} />
                          </div>

                          <div className="seller-cell-info">
                            <strong>
                              {seller.storeName || "Unnamed Store"}
                            </strong>

                            <span>{getOwnerName(seller)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}

                      <td>
                        <div className="table-info">
                          <MapPin size={14} />

                          <span>{getLocation(seller)}</span>
                        </div>
                      </td>

                      {/* Phone */}

                      <td>
                        <div className="table-info">
                          <Phone size={14} />

                          <span>{seller.phone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Approved Date */}

                      <td>
                        <div className="table-info">
                          <CalendarDays size={14} />

                          <span>{formatDate(seller.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}

                      <td>
                        <span className="approved-status">
                          <CheckCircle2 size={13} />

                          <span>Approved</span>
                        </span>
                      </td>

                      {/* Action */}

                      <td>
                        <Link
                          to={`/seller/${seller._id}`}
                          className="view-seller-btn"
                        >
                          <Eye size={15} />

                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            <div className="approved-table-footer">
              <span className="showing-text">
                Showing <strong>{startItem}</strong> –{" "}
                <strong>{endItem}</strong> of <strong>{totalCount}</strong>
              </span>

              <Pagination
                storeKey="admin"
                dataKey="approvedSellers"
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApprovedSellers;
