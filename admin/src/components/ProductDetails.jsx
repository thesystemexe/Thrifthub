import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Store,
  Tag,
  CalendarDays,
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Ruler,
  MapPin,
  User,
  Layers3,
} from "lucide-react";

import {
  adminGetProductDetail,
  adminUpdateProductStatus,
  adminDeleteProduct,
  clearSelectedProduct,
} from "../features/admin/adminSlice";

import "../styles/productDetails.css";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();

  const { selectedProduct, productsLoading, actionLoading, error } =
    useSelector((state) => state.admin);

  useEffect(() => {
    if (productId) {
      dispatch(adminGetProductDetail(productId));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, productId]);

  const product = selectedProduct;

  const handleStatusChange = (status) => {
    if (!product?._id) return;

    dispatch(
      adminUpdateProductStatus({
        productId: product._id,
        status,
      }),
    );
  };

  const handleDelete = async () => {
    if (!product?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`,
    );

    if (!confirmed) return;

    const result = await dispatch(adminDeleteProduct(product._id));

    if (adminDeleteProduct.fulfilled.match(result)) {
      navigate("/products");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (productsLoading || !product) {
    return (
      <div className="product-details-page">
        <div className="product-details-loading">
          <div className="product-details-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Header */}
      <div className="product-details-header">
        <div className="product-details-header-left">
          <Link to="/products" className="back-products-btn">
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>

          <span className="page-eyebrow">Product Management</span>

          <h1>{product.title}</h1>

          <p>
            Review product information, condition, sizing, seller details, and
            listing status.
          </p>
        </div>

        <div
          className={`product-status-badge ${
            product.status === "active" ? "is-active" : "is-disabled"
          }`}
        >
          {product.status === "active" ? (
            <CheckCircle2 size={15} />
          ) : (
            <XCircle size={15} />
          )}

          <span>{product.status === "active" ? "Active" : "Disabled"}</span>
        </div>
      </div>

      {error && <div className="product-details-error">{error}</div>}

      {/* Main Layout */}
      <div className="product-details-layout">
        {/* Left Column */}
        <div className="product-details-main">
          {/* Images */}
          <section className="product-details-card">
            <div className="product-section-heading">
              <div>
                <span className="section-eyebrow">Media</span>
                <h2>Product Images</h2>
              </div>

              <Package size={18} />
            </div>

            <div className="product-gallery">
              {product.images?.length ? (
                product.images.map((image, index) => (
                  <div
                    className="product-gallery-item"
                    key={image._id || index}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                    />
                  </div>
                ))
              ) : (
                <div className="no-product-image">
                  <Package size={28} />
                  <span>No images available</span>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="product-details-card">
            <div className="product-section-heading">
              <div>
                <span className="section-eyebrow">Overview</span>
                <h2>Description</h2>
              </div>
            </div>

            <p className="product-description">
              {product.description || "No description provided."}
            </p>
          </section>

          {/* Product Information */}
          <section className="product-details-card">
            <div className="product-section-heading">
              <div>
                <span className="section-eyebrow">Listing Information</span>
                <h2>Product Details</h2>
              </div>

              <Tag size={18} />
            </div>

            <div className="product-info-grid">
              <div className="product-info-item">
                <span>Category</span>
                <strong>{product.category || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Gender</span>
                <strong>{product.genderCategory || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Brand</span>
                <strong>{product.brand || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Era</span>
                <strong>{product.era || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Condition Grade</span>
                <strong>{product.condition?.grade || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Fabric</span>
                <strong>{product.condition?.fabricComposition || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Made In</span>
                <strong>
                  {product.condition?.madeInCountry?.length
                    ? product.condition.madeInCountry.join(", ")
                    : "N/A"}
                </strong>
              </div>

              <div className="product-info-item">
                <span>Tag Size</span>
                <strong>{product.sizing?.tagSize || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Actual Fit Size</span>
                <strong>{product.sizing?.actualFitSize || "N/A"}</strong>
              </div>

              <div className="product-info-item">
                <span>Price</span>
                <strong>
                  ₹{product.price?.toLocaleString("en-IN") || "0"}
                </strong>
              </div>

              <div className="product-info-item">
                <span>Stock</span>
                <strong>{product.stock ?? 0}</strong>
              </div>

              <div className="product-info-item">
                <span>Reviews</span>
                <strong>{product.numOfReviews ?? 0}</strong>
              </div>
            </div>

            {/* Flaws */}
            <div className="product-flaws">
              <span>Reported Flaws</span>

              {product.condition?.flaws?.length ? (
                <ul>
                  {product.condition.flaws.map((flaw, index) => (
                    <li key={index}>{flaw}</li>
                  ))}
                </ul>
              ) : (
                <p>No flaws reported.</p>
              )}
            </div>
          </section>

          {/* Measurements */}
          <section className="product-details-card">
            <div className="product-section-heading">
              <div>
                <span className="section-eyebrow">Sizing</span>
                <h2>Measurements</h2>
              </div>

              <Ruler size={18} />
            </div>

            <div className="measurement-grid">
              <div className="measurement-item">
                <span>Pit to Pit</span>
                <strong>
                  {product.sizing?.measurements?.pitToPit ?? "N/A"}
                </strong>
              </div>

              <div className="measurement-item">
                <span>Length</span>
                <strong>{product.sizing?.measurements?.length ?? "N/A"}</strong>
              </div>

              <div className="measurement-item">
                <span>Shoulder Width</span>
                <strong>
                  {product.sizing?.measurements?.shoulderWidth ?? "N/A"}
                </strong>
              </div>

              <div className="measurement-item">
                <span>Sleeve Length</span>
                <strong>
                  {product.sizing?.measurements?.sleeveLength ?? "N/A"}
                </strong>
              </div>

              <div className="measurement-item">
                <span>Waist</span>
                <strong>{product.sizing?.measurements?.waist ?? "N/A"}</strong>
              </div>

              <div className="measurement-item">
                <span>Inseam</span>
                <strong>{product.sizing?.measurements?.inseam ?? "N/A"}</strong>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="product-details-card">
            <div className="product-section-heading">
              <div>
                <span className="section-eyebrow">Customer Feedback</span>
                <h2>Reviews</h2>
              </div>

              <div className="rating-summary">
                <Star size={15} />
                <strong>{product.ratings ?? 0}</strong>
                <span>({product.numOfReviews ?? 0})</span>
              </div>
            </div>

            {product.reviews?.length ? (
              <div className="reviews-list">
                {product.reviews.map((review) => (
                  <div className="review-item" key={review._id}>
                    <div className="review-top">
                      <div className="review-user">
                        <div className="review-avatar">
                          <User size={14} />
                        </div>

                        <div>
                          <strong>{review.name || "Anonymous"}</strong>
                          <span>{review.rating}/5 rating</span>
                        </div>
                      </div>

                      <div className="review-stars">
                        {"★".repeat(review.rating || 0)}
                      </div>
                    </div>

                    <p>{review.comment || "No comment provided."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <Star size={24} />
                <p>No reviews yet.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <aside className="product-details-sidebar">
          {/* Seller */}
          <section className="product-sidebar-card">
            <div className="sidebar-heading">
              <Store size={17} />
              <h3>Seller</h3>
            </div>

            <div className="seller-profile">
              <div className="seller-profile-icon">
                <Store size={20} />
              </div>

              <div>
                <strong>
                  {product.seller?.storeName ||
                    product.seller?.name ||
                    "Seller"}
                </strong>

                <span>
                  {typeof product.seller === "string"
                    ? product.seller
                    : product.seller?._id || "N/A"}
                </span>
              </div>
            </div>

            <Link
              to={`/seller/${product.seller?._id || product.seller}`}
              className="seller-link"
            >
              View Seller
            </Link>
          </section>

          {/* Listing Stats */}
          <section className="product-sidebar-card">
            <div className="sidebar-heading">
              <Layers3 size={17} />
              <h3>Listing Stats</h3>
            </div>

            <div className="sidebar-stats">
              <div>
                <span>Price</span>
                <strong>
                  ₹{product.price?.toLocaleString("en-IN") || "0"}
                </strong>
              </div>

              <div>
                <span>Stock</span>
                <strong>{product.stock ?? 0}</strong>
              </div>

              <div>
                <span>Rating</span>
                <strong>{product.ratings ?? 0}/5</strong>
              </div>

              <div>
                <span>Reviews</span>
                <strong>{product.numOfReviews ?? 0}</strong>
              </div>
            </div>
          </section>

          {/* Dates */}
          <section className="product-sidebar-card">
            <div className="sidebar-heading">
              <CalendarDays size={17} />
              <h3>Timeline</h3>
            </div>

            <div className="timeline-info">
              <div>
                <span>Created</span>
                <strong>{formatDate(product.createdAt)}</strong>
              </div>

              <div>
                <span>Last Updated</span>
                <strong>{formatDate(product.updatedAt)}</strong>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="product-sidebar-card product-actions-card">
            <div className="sidebar-heading">
              <Tag size={17} />
              <h3>Admin Actions</h3>
            </div>

            <div className="product-actions">
              {product.status === "active" ? (
                <button
                  type="button"
                  className="product-action-btn disable"
                  onClick={() => handleStatusChange("disabled")}
                  disabled={actionLoading}
                >
                  <XCircle size={16} />
                  <span>
                    {actionLoading ? "Updating..." : "Disable Product"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="product-action-btn activate"
                  onClick={() => handleStatusChange("active")}
                  disabled={actionLoading}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {actionLoading ? "Updating..." : "Activate Product"}
                  </span>
                </button>
              )}

              <button
                type="button"
                className="product-action-btn delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <Trash2 size={16} />
                <span>
                  {actionLoading ? "Processing..." : "Delete Product"}
                </span>
              </button>
            </div>
          </section>

          {/* Product ID */}
          <div className="product-id">
            <span>Product ID</span>
            <code>{product._id}</code>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetails;
