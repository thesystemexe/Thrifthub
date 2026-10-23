import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  Star,
  Search,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import PageTitle from "../../components/PageTitle";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Pagination from "../../components/pagination/Pagination";

import {
  sellerProducts,
  removeErrors,
  sellerDeleteProduct,
  removeSuccess,
} from "../../features/seller/sellerSlice";

import "./sellerProducts.css";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "Tops", label: "Tops" },
  { id: "Bottoms", label: "Bottoms" },
];

const SellerProducts = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    products,
    productCount,
    totalPages,
    isLoading,
    error,
    deleting,
    isSuccess,
  } = useSelector((store) => store.seller);

  /* =========================
     URL VALUES
  ========================= */

  const searchParams = new URLSearchParams(location.search);

  const keywordFromUrl = searchParams.get("keyword") || "";

  const categoryFromUrl = searchParams.get("category") || "all";

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  /* =========================
     LOCAL SEARCH STATE
  ========================= */

  const [searchQuery, setSearchQuery] = useState(keywordFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const currentPage = pageFromUrl;

  /* =========================
     FETCH PRODUCTS
  ========================= */

  useEffect(() => {
    dispatch(
      sellerProducts({
        keyword: keywordFromUrl,
        page: currentPage,
        category: categoryFromUrl === "all" ? "" : categoryFromUrl,
      }),
    );
  }, [dispatch, keywordFromUrl, categoryFromUrl, currentPage]);

  /* =========================
     ERROR
  ========================= */

  useEffect(() => {
    return () => {
      dispatch(removeErrors());
    };
  }, [dispatch]);

  /* =========================
     UPDATE URL
  ========================= */

  const updateFilters = (updates = {}) => {
    const params = new URLSearchParams(location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === "" ||
        value === "all" ||
        value === null ||
        value === undefined
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Every search/filter change starts from page 1
    params.delete("page");

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (e) => {
    e.preventDefault();

    updateFilters({
      keyword: searchQuery.trim(),
    });
  };

  const clearSearch = () => {
    setSearchQuery("");

    updateFilters({
      keyword: "",
    });
  };

  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    updateFilters({
      category,
    });
  };

  /* =========================
     PAGINATION
  ========================= */

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page);
    }

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const handleDelete = (productId) => {
    const isConfirmed = window.confirm("Are you sure want to delete");
    if (isConfirmed) {
      dispatch(sellerDeleteProduct(productId));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Successfully Deleted product");
      dispatch(removeSuccess());
    }
  }, [dispatch, isSuccess]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Couldn't delete product");
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  /* =========================
     SYNC URL → LOCAL STATE
  ========================= */

  useEffect(() => {
    setSearchQuery(keywordFromUrl);
    setSelectedCategory(categoryFromUrl);
  }, [keywordFromUrl, categoryFromUrl]);

  /* =========================
     STOCK STATUS
  ========================= */

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        label: "Out of stock",
        className: "out-stock",
      };
    }

    if (stock <= 5) {
      return {
        label: "Low stock",
        className: "low-stock",
      };
    }

    return {
      label: "In stock",
      className: "in-stock",
    };
  };

  /* =========================
     PRICE
  ========================= */

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  return (
    <>
      <PageTitle title="My Products" />

      <Header />

      <main className="seller-products-page">
        <div className="seller-products-container">
          {/* ================= HEADER ================= */}

          <div className="seller-products-header">
            <div>
              <p className="seller-eyebrow">SELLER INVENTORY</p>

              <h1>My Products</h1>

              <p className="seller-products-subtitle">
                Manage your vintage listings, inventory and product information.
              </p>
            </div>

            <Link to="/seller/product/create" className="create-product-btn">
              <Plus size={18} />
              Create Product
            </Link>
          </div>

          {/* ================= SEARCH + CATEGORY ================= */}

          <div className="seller-products-filters">
            <form className="seller-search-form" onSubmit={handleSearch}>
              <div className="seller-search-field">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery && (
                  <button
                    type="button"
                    className="seller-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}

                <button type="submit" className="seller-search-button">
                  Search
                </button>
              </div>
            </form>

            <div className="seller-category-buttons">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.id)}
                  className={`seller-category-btn ${
                    selectedCategory === category.id ? "active" : ""
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* ================= STATS ================= */}

          <div className="seller-product-stats">
            <div className="seller-stat-card">
              <div className="seller-stat-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Total Products</span>
                <strong>{productCount}</strong>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Products This Page</span>
                <strong>{products.length}</strong>
              </div>
            </div>

            <div className="seller-stat-card">
              <div className="seller-stat-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Current Page</span>
                <strong>
                  {currentPage} / {totalPages || 1}
                </strong>
              </div>
            </div>
          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="seller-products-error">
              <AlertCircle size={20} />

              <div>
                <strong>Couldn't load your products</strong>

                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  dispatch(removeErrors());

                  dispatch(
                    sellerProducts({
                      keyword: keywordFromUrl,
                      page: currentPage,
                      category:
                        categoryFromUrl === "all" ? "" : categoryFromUrl,
                    }),
                  );
                }}
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          {/* ================= LOADING ================= */}

          {isLoading ? (
            <div className="seller-products-loading">
              <div className="seller-loading-spinner"></div>

              <p>Loading your products...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* ================= PRODUCT TABLE ================= */}

              <div className="seller-products-card">
                <div className="seller-products-card-header">
                  <div>
                    <h2>Product Inventory</h2>

                    <p>
                      Showing <strong>{products.length}</strong> of{" "}
                      <strong>{productCount}</strong> products
                    </p>
                  </div>
                </div>

                <div className="seller-products-table-wrap">
                  <table className="seller-products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Condition</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => {
                        const stockStatus = getStockStatus(product.stock);

                        const productImage =
                          product.images?.[0]?.url ||
                          "/placeholder-product.jpg";

                        return (
                          <tr key={product._id}>
                            {/* PRODUCT */}

                            <td>
                              <div className="seller-product-info">
                                <div className="seller-product-image">
                                  <img src={productImage} alt={product.title} />
                                </div>

                                <div className="seller-product-name">
                                  <h3>{product.title}</h3>

                                  {product.brand && (
                                    <span>{product.brand}</span>
                                  )}

                                  <small>
                                    {product.era ? `${product.era} · ` : ""}
                                    {product.genderCategory || "Unisex"}
                                  </small>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}

                            <td>
                              <span className="product-category">
                                {product.category || "—"}
                              </span>
                            </td>

                            {/* CONDITION */}

                            <td>
                              <div className="condition-cell">
                                <span
                                  className={`condition-grade grade-${(
                                    product.condition?.grade || "N"
                                  ).toLowerCase()}`}
                                >
                                  {product.condition?.grade || "—"}
                                </span>

                                <span className="condition-text">
                                  {product.condition?.flaws?.length
                                    ? `${product.condition.flaws.length} flaw${
                                        product.condition.flaws.length !== 1
                                          ? "s"
                                          : ""
                                      }`
                                    : "No flaws listed"}
                                </span>
                              </div>
                            </td>

                            {/* PRICE */}

                            <td>
                              <strong className="product-price">
                                {formatPrice(product.price)}
                              </strong>
                            </td>

                            {/* STOCK */}

                            <td>
                              <div className="stock-cell">
                                <strong>{product.stock}</strong>

                                <span
                                  className={`stock-status ${stockStatus.className}`}
                                >
                                  {stockStatus.label}
                                </span>
                              </div>
                            </td>

                            {/* RATING */}

                            <td>
                              <div className="rating-cell">
                                <Star size={14} fill="currentColor" />

                                <strong>{product.ratings || 0}</strong>

                                <span>({product.numOfReviews || 0})</span>
                              </div>
                            </td>

                            {/* ACTIONS */}

                            <td>
                              <div className="product-actions">
                                <Link
                                  to={`/product/${product._id}`}
                                  className="product-action-btn view"
                                  title="View product"
                                >
                                  <Eye size={16} />
                                </Link>

                                <Link
                                  to={`/seller/product/update-product/${product._id}`}
                                  className="product-action-btn edit"
                                  title="Edit product"
                                >
                                  <Edit3 size={16} />
                                </Link>

                                <button
                                  type="button"
                                  className="product-action-btn delete"
                                  title="Delete product"
                                  onClick={() => handleDelete(product._id)}
                                  disabled={deleting[product._id]}
                                >
                                  {deleting[product._id] ? (
                                    <Loader size={16} />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================= PAGINATION ================= */}

              <Pagination
                currentPage={currentPage}
                onPageChange={handlePageChange}
                storeKey="seller"
              />
            </>
          ) : (
            /* ================= EMPTY ================= */

            <div className="seller-products-empty">
              <div className="empty-icon">
                <Package size={32} />
              </div>

              <h2>
                {keywordFromUrl || categoryFromUrl !== "all"
                  ? "No products found"
                  : "No products yet"}
              </h2>

              <p>
                {keywordFromUrl || categoryFromUrl !== "all"
                  ? "Try a different title or category."
                  : "You haven't listed any products yet. Start building your ThriftHub collection by adding your first vintage item."}
              </p>

              <Link to="/seller/product/create" className="empty-create-btn">
                <Plus size={18} />
                Create Product
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default SellerProducts;
