import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Ruler } from "lucide-react";
import Rating from "../rating/Rating";
import "./productCard.css";

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite(product._id);
    }
  };

  // Image source fallback
  const mainImage =
    product.images && product.images.length > 0 && product.images[0]?.url
      ? product.images[0].url
      : "/placeholder-product.jpg";

  // Dynamic measurement display string
  const getPrimaryMeasurement = (sizing) => {
    if (!sizing?.measurements) return null;
    const { pitToPit, length, waist, inseam } = sizing.measurements;
    if (pitToPit > 0) return `PTP: ${pitToPit}"`;
    if (length > 0) return `Length: ${length}"`;
    if (waist > 0 && inseam > 0) return `W${waist} / L${inseam}`;
    return null;
  };

  // Condition metadata join string
  // Dynamic condition metadata string
  const conditionMeta = [
    product.condition?.madeInCountry
      ? `Made in ${product.condition.madeInCountry}`
      : null,
    product.condition?.fabricComposition,
    product.condition?.flaws && product.condition.flaws.length > 0
      ? product.condition.flaws[0]
      : "No noticeable flaws",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="product-card-container">
      <article className="product-card">
        {/* ================= IMAGE AREA ================= */}
        <div className="product-card-image-wrapper">
          {/* Top Left Badges */}
          <div className="product-card-badges">
            {product.era && (
              <span className="product-badge era-badge">
                {product.era} ARCHIVE
              </span>
            )}
            {product.brand && (
              <span className="product-badge brand-badge">{product.brand}</span>
            )}
          </div>

          {/* Top Right Heart Icon */}
          <button
            type="button"
            className={`product-card-fav-btn ${isFavorite ? "favorited" : ""}`}
            onClick={handleFavoriteClick}
            aria-label="Save product"
          >
            <Heart
              size={16}
              fill={isFavorite ? "var(--th-accent-terracotta)" : "none"}
            />
          </button>

          {/* Main Product Image */}
          <Link
            to={`/product/${product._id}`}
            className="product-card-img-link"
          >
            <img
              src={mainImage}
              alt={product.title || "Product image"}
              className="product-card-image"
              loading="lazy"
            />
          </Link>

          {/* Bottom Image Overlay Bar */}
          <div className="product-card-size-strip">
            <div className="size-strip-left">
              <Ruler size={13} className="size-icon" />
              <span>
                Fit:{" "}
                {product.sizing?.actualFitSize ||
                  product.sizing?.tagSize ||
                  "Standard"}
              </span>
            </div>
            {getPrimaryMeasurement(product.sizing) && (
              <span className="size-strip-right">
                {getPrimaryMeasurement(product.sizing)}
              </span>
            )}
          </div>
        </div>

        {/* ================= DETAILS AREA ================= */}
        <div className="product-card-details">
          {/* Brand Eyebrow Header */}
          <div className="product-card-category-eyebrow">
            {product.brand
              ? `${product.brand.toUpperCase()} ARCHIVE`
              : "VINTAGE DROP"}
          </div>

          {/* Product Title */}
          <h3 className="product-card-title">
            <Link to={`/product/${product._id}`}>{product.title}</Link>
          </h3>

          {/* Metadata Row: Made In, Fabric, Flaws */}
          {conditionMeta && (
            <p className="product-card-condition-meta">{conditionMeta}</p>
          )}

          {/* Rating */}
          <div className="product-card-rating">
            <Rating value={product.ratings || 0} disabled={true} />
            <span className="product-card-reviews">
              ({product.numOfReviews || 0}{" "}
              {product.numOfReviews === 1 ? "Review" : "Reviews"})
            </span>
          </div>

          {/* Card Footer: Price & Direct CTA */}
          <div className="product-card-footer">
            <div className="product-card-price-group">
              <span className="product-card-price-value">₹{product.price}</span>
            </div>

            <Link
              to={`/product/${product._id}`}
              className={`product-card-buy-btn ${product.stock === 0 ? "disabled" : ""}`}
            >
              {product.stock > 0 ? "View Item" : "Sold Out"}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ProductCard;
