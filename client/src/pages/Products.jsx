import React, { useEffect, useState } from "react";
import "../styles/products.css";

import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductCard from "../components/productCard/ProductCard";
import Loader from "../components/Loader";
import NoProducts from "../components/NoProducts";
import Pagination from "../components/pagination/Pagination";

import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  Ruler,
  RotateCcw,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  userGetProducts,
  removeErrors,
  userToggleFavorite,
} from "../features/products/productSlice";

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "Sweaters", label: "Sweaters" },
  { id: "Tops", label: "Tops" },
  { id: "Bottoms", label: "Bottoms" },
  { id: "Outerwear", label: "Outerwear" },
  { id: "Shirts", label: "Shirts" },
];

const ERAS = [
  "All Eras",
  "1970s & Earlier",
  "1980s Vintage",
  "1990s Golden Era",
  "Early 2000s (Y2K)",
];

const SIZES = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL"];

const Products = () => {
  const {
    products,
    isLoading,
    error,
    resultPerPage,
    productCount,
    totalPages,
    favorites,
  } = useSelector((store) => store.product);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);

  const keywordFromUrl = searchParams.get("keyword") || "";

  const categoryFromUrl = searchParams.get("category") || "all";
  const eraFromUrl = searchParams.get("era") || "All Eras";
  const sizeFromUrl = searchParams.get("tagSize") || "All Sizes";
  const maxPriceFromUrl = Number(searchParams.get("price[lte]")) || 5000;
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const [searchQuery, setSearchQuery] = useState(keywordFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedEra, setSelectedEra] = useState(eraFromUrl);
  const [selectedSize, setSelectedSize] = useState(sizeFromUrl);
  const [maxPrice, setMaxPrice] = useState(maxPriceFromUrl);

  const currentPage = pageFromUrl;

  // --------------------------------------------------
  // Fetch products whenever filters / page change
  // --------------------------------------------------

  useEffect(() => {
    dispatch(
      userGetProducts({
        keyword: keywordFromUrl,
        page: currentPage,
        category: categoryFromUrl === "all" ? "" : categoryFromUrl,
        era: eraFromUrl === "All Eras" ? "" : eraFromUrl,
        tagSize: sizeFromUrl === "All Sizes" ? "" : sizeFromUrl,
        maxPrice: maxPriceFromUrl,
      }),
    );
  }, [
    dispatch,
    keywordFromUrl,
    currentPage,
    categoryFromUrl,
    eraFromUrl,
    sizeFromUrl,
    maxPriceFromUrl,
  ]);

  // --------------------------------------------------
  // Error handling
  // --------------------------------------------------

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
  }, [error, dispatch]);

  // --------------------------------------------------
  // Update URL helper
  // --------------------------------------------------

  const updateFilters = (updates = {}) => {
    const params = new URLSearchParams(location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === "" ||
        value === "all" ||
        value === "All Eras" ||
        value === "All Sizes" ||
        value === null ||
        value === undefined
      ) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Any filter change should start from page 1
    params.delete("page");

    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Category
  // --------------------------------------------------

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    updateFilters({
      category,
    });
  };

  // --------------------------------------------------
  // Era
  // --------------------------------------------------

  const handleEraChange = (era) => {
    setSelectedEra(era);

    updateFilters({
      era,
    });
  };

  // --------------------------------------------------
  // Size
  // --------------------------------------------------

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    updateFilters({
      tagSize: size,
    });
  };

  // --------------------------------------------------
  // Price
  // --------------------------------------------------

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);

    setMaxPrice(value);

    updateFilters({
      "price[lte]": value,
    });
  };

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedEra("All Eras");
    setSelectedSize("All Sizes");
    setMaxPrice(5000);

    navigate(location.pathname);
  };

  // --------------------------------------------------
  // Favorites
  // --------------------------------------------------

  const handleToggleFavorite = (productId) => {
    dispatch(userToggleFavorite(productId));
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Keep local state synced with URL
  // --------------------------------------------------

  useEffect(() => {
    setSearchQuery(keywordFromUrl);
    setSelectedCategory(categoryFromUrl);
    setSelectedEra(eraFromUrl);
    setSelectedSize(sizeFromUrl);
    setMaxPrice(maxPriceFromUrl);
  }, [
    keywordFromUrl,
    categoryFromUrl,
    eraFromUrl,
    sizeFromUrl,
    maxPriceFromUrl,
  ]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <PageTitle title="All Products" />
      <Header />

      <div className="th-catalog-page">
        {/* ============================================
            HEADER
        ============================================ */}

        <section className="th-catalog-header">
          <div className="th-catalog-container">
            <div className="th-catalog-title-row">
              <div>
                <div className="th-badge-provenance">
                  <span className="th-pulse"></span>

                  <span>CURATED VINTAGE MARKETPLACE</span>
                </div>

                <h1 className="th-catalog-title">Explore the Collection</h1>

                <p className="th-catalog-sub">
                  Browse vintage clothing by category, era, size, price, and
                  title.
                </p>
              </div>
            </div>

            {/* Search */}

            <form className="th-catalog-search-bar" onSubmit={handleSearch}>
              <div className="th-search-field">
                <Search className="th-search-icon" size={20} />

                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="th-search-input"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="th-clear-search"
                  >
                    <X size={16} />
                  </button>
                )}

                <button type="submit" className="th-search-button">
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/*Main layout*/}

        <div className="th-catalog-container th-catalog-layout">
          {/*Side bar */}

          <aside className="th-catalog-sidebar">
            <div className="th-sidebar-header">
              <div className="th-sidebar-title">
                <SlidersHorizontal size={18} />
                <h3>Refine Collection</h3>
              </div>

              <button onClick={resetFilters} className="th-btn-reset">
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* CATEGORY */}

            <div className="th-filter-block">
              <h4 className="th-filter-heading">Categories</h4>

              <div className="th-category-list">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`th-cat-btn ${
                      selectedCategory === cat.id ? "active" : ""
                    }`}
                  >
                    <span>{cat.label}</span>

                    {selectedCategory === cat.id && (
                      <span className="th-filter-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE */}

            <div className="th-filter-block">
              <div className="th-filter-heading-row">
                <h4 className="th-filter-heading">Maximum Price</h4>

                <span className="th-filter-price-val">₹{maxPrice}</span>
              </div>

              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={handlePriceChange}
                className="th-range-slider"
              />

              <div className="th-range-labels">
                <span>₹100</span>
                <span>₹2500</span>
                <span>₹5000+</span>
              </div>
            </div>

            {/* ERA */}

            <div className="th-filter-block">
              <h4 className="th-filter-heading">Archival Era</h4>

              <div className="th-pill-selector">
                {ERAS.map((era) => (
                  <button
                    key={era}
                    onClick={() => handleEraChange(era)}
                    className={`th-era-chip ${
                      selectedEra === era ? "active" : ""
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE */}

            <div className="th-filter-block">
              <h4 className="th-filter-heading">Tag Size</h4>

              <div className="th-size-grid">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`th-size-chip ${
                      selectedSize === size ? "active" : ""
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products */}

          <main className="th-catalog-main">
            <div className="th-catalog-toolbar">
              <div className="th-telemetry-text">
                Showing <strong>{products.length}</strong> of{" "}
                <strong>{productCount}</strong> products
              </div>

              <div className="th-results-page">
                Page <strong>{currentPage}</strong>
                {totalPages > 0 && <> / {totalPages}</>}
              </div>
            </div>

            {products.length > 0 ? (
              <div className="th-dashboard-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    isFavorite={favorites.some(
                      (item) => item._id === product._id,
                    )}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <NoProducts keyword={keywordFromUrl} />
            )}

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Products;
