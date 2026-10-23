import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Search,
  Package,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Store,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import { adminGetProducts } from "../features/admin/adminSlice";

import Pagination from "../components/pagination/Pagination";
import "../styles/products.css";

const Products = () => {
  const dispatch = useDispatch();

  const {
    products,
    totalCount,
    currentPage,
    resultPerPage,
    productsLoading,
    error,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Fetch products
  // --------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        adminGetProducts({
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
      adminGetProducts({
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
      adminGetProducts({
        page: currentPage,
        keyword: search,
      }),
    );
  };

  // --------------------------------------------------
  // Format price
  // --------------------------------------------------

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "N/A";
    }

    return `₹${Number(price).toLocaleString("en-IN")}`;
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
  // Product image
  // --------------------------------------------------

  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) {
      return null;
    }

    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return firstImage?.url || null;
  };

  // --------------------------------------------------
  // Seller name
  // --------------------------------------------------

  const getSellerName = (product) => {
    if (!product.seller) {
      return "Unknown Seller";
    }

    if (typeof product.seller === "object") {
      return (
        product.seller.storeName ||
        product.seller.ownerName ||
        product.seller.name ||
        product.seller.username ||
        product.seller.email ||
        "Seller"
      );
    }

    return product.sellerName || product.seller;
  };

  // --------------------------------------------------
  // Pagination result numbers
  // --------------------------------------------------

  const startItem =
    totalCount === 0 ? 0 : (currentPage - 1) * resultPerPage + 1;

  const endItem = Math.min(currentPage * resultPerPage, totalCount);

  return (
    <div className="admin-products-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="products-header">
        <div className="products-header-content">
          <span className="products-eyebrow">Product Management</span>

          <h1>Products</h1>

          <p>
            Manage and review all products listed by approved ThriftHub sellers.
          </p>
        </div>

        <div className="products-header-stat">
          <Package size={18} />

          <div>
            <span>Total Products</span>
            <strong>{totalCount}</strong>
          </div>
        </div>
      </header>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section className="products-toolbar">
        <div className="products-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products by title..."
            aria-label="Search products"
          />

          {search && (
            <button
              type="button"
              className="products-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="products-refresh-btn"
          onClick={handleRefresh}
          disabled={productsLoading}
        >
          <RefreshCw
            size={15}
            className={productsLoading ? "products-refresh-spinning" : ""}
          />

          <span>Refresh</span>
        </button>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="products-error">
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          PRODUCT TABLE CARD
      ===================================================== */}

      <section className="products-table-card">
        {/* TABLE HEADER */}

        <div className="products-table-top">
          <div>
            <span className="products-table-eyebrow">Product Directory</span>

            <h2>All Listed Products</h2>
          </div>

          <div className="products-table-count">
            <Package size={15} />

            <span>
              {totalCount} {totalCount === 1 ? "product" : "products"}
            </span>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {productsLoading ? (
          <div className="products-state">
            <div className="products-spinner" />

            <h3>Loading products...</h3>

            <p>Fetching the latest products from ThriftHub.</p>
          </div>
        ) : error ? (
          /* =====================================================
              ERROR STATE
          ===================================================== */

          <div className="products-state">
            <div className="products-state-icon">
              <Package size={24} />
            </div>

            <h3>Unable to load products</h3>

            <p>{error}</p>

            <button
              type="button"
              className="products-retry-btn"
              onClick={handleRefresh}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          /* =====================================================
              EMPTY STATE
          ===================================================== */

          <div className="products-state">
            <div className="products-state-icon">
              <Package size={24} />
            </div>

            <h3>{search ? "No products found" : "No products available"}</h3>

            <p>
              {search
                ? "Try searching with a different product name."
                : "There are currently no products listed on ThriftHub."}
            </p>

            {search && (
              <button
                type="button"
                className="products-retry-btn"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                TABLE
            ================================================= */}

            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Listed On</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const image = getProductImage(product);

                    const productStatus = product.status || "active";

                    const isActive = productStatus === "active";

                    return (
                      <tr key={product._id}>
                        {/* PRODUCT */}

                        <td>
                          <div className="product-cell">
                            <div className="product-image-wrapper">
                              {image ? (
                                <img
                                  src={image}
                                  alt={product.title || "Product"}
                                  className="product-image"
                                />
                              ) : (
                                <div className="product-image-placeholder">
                                  <Package size={20} />
                                </div>
                              )}
                            </div>

                            <div className="product-cell-info">
                              <strong>
                                {product.title || "Untitled Product"}
                              </strong>

                              {product.category && (
                                <span>{product.category}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SELLER */}

                        <td>
                          <div className="product-seller">
                            <div className="product-seller-icon">
                              <Store size={15} />
                            </div>

                            <span>{getSellerName(product)}</span>
                          </div>
                        </td>

                        {/* PRICE */}

                        <td>
                          <div className="product-price">
                            <IndianRupee size={14} />

                            <span>{formatPrice(product.price)}</span>
                          </div>
                        </td>

                        {/* DATE */}

                        <td>
                          <div className="product-date">
                            <CalendarDays size={14} />

                            <span>{formatDate(product.createdAt)}</span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          {isActive ? (
                            <span className="product-status active">
                              <CheckCircle2 size={13} />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="product-status disabled">
                              <XCircle size={13} />
                              <span>Disabled</span>
                            </span>
                          )}
                        </td>

                        {/* ACTION */}

                        <td>
                          <Link
                            to={`/product/${product._id}`}
                            className="product-view-btn"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* =================================================
                TABLE FOOTER
            ================================================= */}

            <div className="products-table-footer">
              <span className="products-showing-text">
                Showing <strong>{startItem}</strong> –{" "}
                <strong>{endItem}</strong> of <strong>{totalCount}</strong>
              </span>

              <Pagination
                storeKey="admin"
                dataKey="products"
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Products;
