import React from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductCard from "../components/productCard/ProductCard";

import {
  userToggleFavorite,
  userClearFavorites,
} from "../features/products/productSlice";

import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import "../styles/favorites.css";

const Favorites = () => {
  const dispatch = useDispatch();

  const { favorites } = useSelector((store) => store.product);

  const handleToggleFavorite = (productId) => {
    dispatch(userToggleFavorite(productId));
  };

  const handleClearFavorites = () => {
    dispatch(userClearFavorites());
  };

  console.log(favorites);

  return (
    <>
      <PageTitle title="Favorites | ThriftHub" />

      <Header />

      <main className="favorites-page">
        <div className="favorites-container">
          <div className="favorites-header">
            <div className="favorites-heading-group">
              <div className="favorites-eyebrow">
                <span className="favorites-eyebrow-line"></span>

                <span className="favorites-eyebrow-text">
                  YOUR CURATED ARCHIVE
                </span>
              </div>

              <h1 className="favorites-title">Favorites</h1>

              <p className="favorites-description">
                Pieces you've saved for later. Your personal collection of
                vintage finds and archival drops.
              </p>
            </div>

            <div className="favorites-header-actions">
              <div className="favorites-count">
                <Heart size={15} />

                <span>
                  {favorites.length}{" "}
                  {favorites.length === 1 ? "Piece" : "Pieces"}
                </span>
              </div>

              {favorites.length > 0 && (
                <button
                  type="button"
                  className="favorites-clear-btn"
                  onClick={handleClearFavorites}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {favorites.length > 0 ? (
            <div className="favorites-grid">
              {favorites.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="favorites-empty">
              <div className="favorites-empty-icon">
                <Heart size={28} />
              </div>

              <span className="favorites-empty-eyebrow">NOTHING SAVED YET</span>

              <h2>Your archive is waiting.</h2>

              <p>
                Save pieces you love and they'll appear here for you to revisit
                anytime.
              </p>

              <Link to="/products" className="favorites-shop-btn">
                Explore Products
              </Link>
            </div>
          )}

          {favorites.length > 0 && (
            <div className="favorites-bottom-nav">
              <Link to="/products" className="favorites-back-link">
                <ArrowLeft size={15} />
                Continue Exploring
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Favorites;
