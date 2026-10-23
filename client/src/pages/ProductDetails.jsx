import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Rating from "../components/rating/Rating";
import Loader from "../components/Loader";

import {
  removeErrors,
  removeReviewSuccess,
  userCreateReview,
  userGetProductDetail,
  userToggleFavorite,
} from "../features/products/productSlice";

import "../styles/productDetails.css";
import {
  removeMessage,
  userAddToCartProduct,
} from "../features/cart/cartSlice";

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();

  const { isLoading, error, product, reviewSuccess, reviewLoading, favorites } =
    useSelector((store) => store.product);
  const {
    isLoading: cartLoading,
    error: cartError,
    isSuccess,
    message,
    cartItems,
  } = useSelector((store) => store.cart);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  /* =====================================================
     FETCH PRODUCT
  ===================================================== */

  useEffect(() => {
    if (productId) {
      dispatch(userGetProductDetail(productId));
    }

    return () => {
      dispatch(removeErrors());
    };
  }, [dispatch, productId]);

  /* =====================================================
     ERROR HANDLING
  ===================================================== */

  useEffect(() => {
    if (error) {
      toast.error(error || "Something went wrong");
      dispatch(removeErrors());
    }

    if (cartError) {
      toast.error(cartError || "Something went wrong");
    }
  }, [dispatch, error, cartError]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(message);
      dispatch(removeMessage());
    }
  }, [dispatch, isSuccess, message]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully");
      setUserRating(0);
      setReviewComment("");
      dispatch(removeReviewSuccess());
      dispatch(userGetProductDetail(productId));
    }
  }, [reviewSuccess, productId, dispatch]);

  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const images = product?.images || [];
  const stock = product?.stock || 0;

  const condition = product?.condition || {};
  const sizing = product?.sizing || {};

  const flaws = Array.isArray(condition.flaws)
    ? condition.flaws
    : condition.flaws
      ? [condition.flaws]
      : [];

  const currentImage = images[selectedImage]?.url;

  // Checking for something

  const itemInCart = cartItems.find((item) => item.product === productId);
  const currentCartQty = itemInCart ? itemInCart.quantity : 0;

  // Maximum quantity allowed to be added right now
  const isMaxStockInCart = currentCartQty + quantity > stock;

  /* =====================================================
     QUANTITY
  ===================================================== */

  const increaseQuantity = () => {
    if (quantity < stock) {
      setQuantity((previousQuantity) => previousQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    setQuantity((previousQuantity) => Math.max(1, previousQuantity - 1));
  };

  const isFavorite = favorites.some(
    (item) => item?._id?.toString() === product?._id?.toString(),
  );

  /* =====================================================
     IMAGE NAVIGATION
  ===================================================== */

  const nextImage = () => {
    if (images.length === 0) return;
    setSelectedImage((previousIndex) =>
      previousIndex === images.length - 1 ? 0 : previousIndex + 1,
    );
  };

  const previousImage = () => {
    if (images.length === 0) return;
    setSelectedImage((previousIndex) =>
      previousIndex === 0 ? images.length - 1 : previousIndex - 1,
    );
  };

  /* =====================================================
     REVIEW
  ===================================================== */

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
  };

  const handleReviewSubmit = (event) => {
    event.preventDefault();

    if (!userRating) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a review");
      return;
    }

    console.log({
      productId,
      rating: userRating,
      comment: reviewComment,
    });

    // Dispatch your review action here when it is available.
    dispatch(
      userCreateReview({
        rating: userRating,
        comment: reviewComment,
        productId,
      }),
    );
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = () => {
    if (!product || stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    console.log("Buy product:", {
      productId: product._id,
      quantity,
    });

    toast.success("Proceeding to purchase");
  };

  /* =====================================================
     ADD TO BAG
  ===================================================== */

  const handleAddToBag = () => {
    if (!product || stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (isMaxStockInCart) {
      toast.error("Cannot add more than total available stock");
      return;
    }
    // Dispatch your add-to-cart action here when it is available.
    dispatch(userAddToCartProduct({ productId, quantity }));
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {
    return <Loader />;
  }

  /* =====================================================
     PRODUCT NOT FOUND
  ===================================================== */

  if (error || !product) {
    return (
      <>
        <PageTitle title="Product Details" />
        <Header />

        <main className="th-pdp-wrapper">
          <div className="th-pdp-empty">
            <h2>Product not found</h2>
            <p>This product may have been removed or is no longer available.</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <PageTitle title={`${product.title} - Details`} />

      <Header />

      <main className="th-pdp-wrapper">
        <div className="th-pdp-container">
          {/* =================================================
              MAIN PRODUCT GRID
          ================================================= */}

          <div className="th-pdp-grid">
            {/* =================================================
                LEFT — IMAGE GALLERY
            ================================================= */}

            <div className="th-gallery-col">
              <div className="th-main-stage">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="th-stage-img"
                  />
                ) : (
                  <div className="th-no-image">No image available</div>
                )}

                {/* Favorite Button */}

                <button
                  type="button"
                  className={`th-stage-fav-btn ${
                    isFavorite ? "favorited" : ""
                  }`}
                  onClick={() => dispatch(userToggleFavorite(product._id))}
                  aria-label={
                    isFavorite
                      ? "Remove product from favorites"
                      : "Add product to favorites"
                  }
                >
                  <Heart
                    size={20}
                    fill={isFavorite ? "currentColor" : "none"}
                  />
                </button>

                {/* Image Navigation */}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="th-gallery-arrow th-gallery-arrow-left"
                      onClick={previousImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      className="th-gallery-arrow th-gallery-arrow-right"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}

              {images.length > 0 && (
                <div className="th-thumb-strip">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image._id || index}
                      className={`th-thumb-btn ${
                        selectedImage === index ? "active" : ""
                      }`}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.title} ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Condition and Flaws */}

              <div className="th-flaws-card">
                <div className="th-flaws-header">
                  <div className="th-flaws-title">
                    <span className="th-section-label">ARCHIVE REPORT</span>
                    <h4>Condition & Flaws</h4>
                  </div>

                  {condition.grade && (
                    <span className="th-grade-pill">
                      Grade {condition.grade}
                    </span>
                  )}
                </div>

                {flaws.length > 0 ? (
                  <ul className="th-flaws-list">
                    {flaws.map((flaw, index) => (
                      <li key={index}>{flaw}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="th-flaws-text">
                    No major flaws reported. Please review all product images
                    carefully.
                  </p>
                )}

                <div className="th-audit-info">
                  {condition.grade && (
                    <span className="th-audit-tag">
                      Condition: {condition.grade}
                    </span>
                  )}

                  {condition.madeInCountry && (
                    <span className="th-audit-tag">
                      Made in {condition.madeInCountry}
                    </span>
                  )}

                  {product.era && (
                    <span className="th-audit-tag">{product.era}</span>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT — PRODUCT INFORMATION
            ================================================= */}

            <div className="th-details-col">
              {/* Brand and Location */}

              <div className="th-seller-meta-bar">
                <div className="th-seller-info">
                  <span className="th-seller-name">
                    {product.brand || "Vintage Archive"}
                  </span>

                  <span className="th-seller-separator">•</span>

                  <span className="th-seller-location">
                    Made in {condition.madeInCountry || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Brand and Title */}

              <span className="th-brand-tag">
                {product.brand || "ARCHIVAL PIECE"}
              </span>

              <h1 className="th-product-title">{product.title}</h1>

              {/* Rating */}

              <div className="th-product-rating">
                <Rating value={product.ratings || 0} disabled={true} />

                <span>
                  {product.ratings ? Number(product.ratings).toFixed(1) : "0.0"}
                </span>

                <span className="th-rating-divider">•</span>

                <span>
                  {product.numOfReviews || 0}{" "}
                  {product.numOfReviews === 1 ? "Review" : "Reviews"}
                </span>
              </div>

              {/* Description */}

              {product.description && (
                <p className="th-product-description">{product.description}</p>
              )}

              {/* Updated Price Section */}

              <div className="th-pricing-card">
                <span className="th-price-label">ARCHIVE PRICE</span>

                <div className="th-price-row">
                  <span className="th-price-currency">₹</span>
                  <span className="th-price-now">
                    {Number(product.price).toLocaleString("en-IN")}
                  </span>
                </div>

                <span className="th-price-note">
                  Final price · Taxes calculated at checkout
                </span>
              </div>

              {/* Product Specifications */}

              <div className="th-product-specs">
                {condition.fabricComposition && (
                  <div className="th-spec-item">
                    <span>Fabric</span>
                    <strong>{condition.fabricComposition}</strong>
                  </div>
                )}

                {sizing.tagSize && (
                  <div className="th-spec-item">
                    <span>Tagged Size</span>
                    <strong>{sizing.tagSize}</strong>
                  </div>
                )}

                {sizing.actualFitSize && (
                  <div className="th-spec-item">
                    <span>Fit Size</span>
                    <strong>{sizing.actualFitSize}</strong>
                  </div>
                )}

                {product.genderCategory && (
                  <div className="th-spec-item">
                    <span>Category</span>
                    <strong>{product.genderCategory}</strong>
                  </div>
                )}
              </div>

              {/* Stock */}

              <div className="th-stock-status">
                <span className={stock > 0 ? "in-stock" : "out-of-stock"}>
                  {stock > 0 ? `${stock} available` : "Out of stock"}
                </span>
              </div>

              {/* Quantity */}

              {stock > 0 && (
                <div className="th-quantity-row">
                  <span className="th-quantity-label">Quantity</span>

                  <div className="th-quantity-control">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={quantity >= stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Buy and Add to Bag Buttons */}

              <div className="th-action-group">
                <button
                  type="button"
                  className="th-btn-buy"
                  disabled={stock <= 0}
                  onClick={handleBuyNow}
                >
                  <ShoppingBag size={18} />
                  {stock > 0 ? "Buy Now" : "Out of Stock"}
                </button>

                <button
                  type="button"
                  className="th-btn-bag"
                  disabled={stock <= 0 || cartLoading || isMaxStockInCart}
                  onClick={handleAddToBag}
                >
                  <ShoppingCart size={18} />
                  {cartLoading ? "Adding" : " Add to Bag"}
                </button>
              </div>

              {/* Product Information */}

              <div className="th-information-box">
                <div className="th-information-item">
                  <span>Brand</span>
                  <strong>{product.brand || "Not specified"}</strong>
                </div>

                <div className="th-information-item">
                  <span>Made In</span>
                  <strong>{condition.madeInCountry || "Not specified"}</strong>
                </div>

                <div className="th-information-item">
                  <span>Era</span>
                  <strong>{product.era || "Not specified"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              REVIEWS
          ================================================= */}

          <section className="th-reviews-section">
            <div className="th-reviews-header">
              <div>
                <span className="th-reviews-eyebrow">CUSTOMER FEEDBACK</span>

                <h2>Customer Reviews</h2>
              </div>

              <div className="th-review-summary">
                <Rating value={product.ratings || 0} disabled={true} />

                <span>
                  {Number(product.ratings || 0).toFixed(1)} ·{" "}
                  {product.numOfReviews || 0} reviews
                </span>
              </div>
            </div>

            <div className="th-reviews-grid">
              {/* Write Review */}

              <div className="th-review-form-col">
                <form className="th-review-form" onSubmit={handleReviewSubmit}>
                  <h3>Write a review</h3>

                  <div className="th-write-rating">
                    <span>Your rating</span>

                    <Rating
                      value={userRating}
                      disabled={false}
                      onRatingChange={handleRatingChange}
                    />
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    className="th-review-input"
                    placeholder="Share your experience with this piece..."
                  />

                  <button
                    type="submit"
                    className="th-submit-review"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? "Submitting.." : " Submit Review"}
                  </button>
                </form>
              </div>

              {/* Existing Reviews */}

              <div className="th-review-feed-col">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="th-review-feed-list">
                    {product.reviews.map((review, index) => (
                      <article
                        className="th-review-item"
                        key={review._id || index}
                      >
                        <div className="th-review-top">
                          <Rating value={review.rating || 0} disabled={true} />

                          <span className="th-review-name">
                            {review.name || "Anonymous"}
                          </span>
                        </div>

                        <p className="th-review-comment">{review.comment}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="th-no-reviews">
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this piece.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;
