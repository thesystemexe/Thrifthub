import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/productCard/ProductCard";
import "../styles/featuredProducts.css";
import { userToggleFavorite } from "../features/products/productSlice";

const FeaturedProducts = ({ products }) => {
  const dispatch = useDispatch();

  const { favorites } = useSelector((store) => store.product);

  const handleToggleFavorite = (productId) => {
    dispatch(userToggleFavorite(productId));
  };

  return (
    <section className="featured-section">
      <div className="featured-container">
        {/* ================= HEADER ================= */}

        <div className="featured-header">
          <div className="featured-heading-group">
            <div className="featured-eyebrow">
              <span className="featured-eyebrow-line"></span>

              <span className="featured-eyebrow-text">
                CURATED SECONDHAND EXCLUSIVES
              </span>
            </div>

            <h2 className="featured-heading">Featured Archival Drops</h2>

            <p className="featured-description">
              Discover carefully selected vintage and secondhand pieces, curated
              for quality, character, and timeless style.
            </p>
          </div>

          <Link to="/products" className="featured-explore-btn">
            <span>Explore All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ================= PRODUCT GRID ================= */}

        <div className="featured-product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isFavorite={favorites.some((item) => item._id === product._id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <div className="featured-empty">
              <h3>No products available</h3>

              <p>Check back later for new archival drops.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
