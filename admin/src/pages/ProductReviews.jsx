import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw, FiTrash2 } from "react-icons/fi";

import {
  adminGetProductReviews,
  adminDeleteReview,
  removeErrors,
  clearSelectedProductReviews,
} from "../features/admin/adminSlice";

import PageTitle from "../../../client/src/components/PageTitle";
import Loader from "../../../client/src/components/Loader";

import "../styles/productReviews.css";

const ProductReviews = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();

  const {
    selectedProductReviews,
    selectedProduct,
    reviewsLoading,
    actionLoading,
    error,
  } = useSelector((state) => state.admin);

  const [deleteReview, setDeleteReview] = useState(null);

  useEffect(() => {
    if (productId) {
      dispatch(adminGetProductReviews(productId));
    }

    return () => {
      dispatch(clearSelectedProductReviews());
      dispatch(removeErrors());
    };
  }, [dispatch, productId]);

  const handleRefresh = () => {
    dispatch(adminGetProductReviews(productId));
  };

  const handleDelete = async () => {
    if (!deleteReview) return;

    await dispatch(
      adminDeleteReview({
        productId,
        reviewId: deleteReview.reviewId,
      }),
    );

    setDeleteReview(null);
  };

  const renderStars = (rating) => {
    return (
      <div className="product-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Number(rating)
                ? "product-review-star active"
                : "product-review-star"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const averageRating = Number(selectedProduct?.rating || 0).toFixed(1);

  return (
    <>
      <PageTitle
        title={
          selectedProduct?.name
            ? `${selectedProduct.name} Reviews`
            : "Product Reviews"
        }
      />

      <div className="product-reviews-page">
        {/* TOP */}
        <div className="product-reviews-top">
          <Link to="/reviews" className="back-to-reviews">
            <FiArrowLeft />
            Back to Reviews
          </Link>

          <div className="product-reviews-heading">
            <span className="product-reviews-eyebrow">PRODUCT FEEDBACK</span>

            <h1>Product Reviews</h1>

            <p>View and manage customer feedback for this product.</p>
          </div>
        </div>

        {error && <div className="product-reviews-error">{error}</div>}

        {reviewsLoading ? (
          <div className="product-reviews-loader">
            <Loader />
          </div>
        ) : (
          <>
            {/* PRODUCT SUMMARY */}
            {selectedProduct && (
              <div className="product-summary-card">
                <div className="product-summary-image">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>

                <div className="product-summary-content">
                  <span className="product-summary-label">PRODUCT</span>

                  <h2>{selectedProduct.name}</h2>

                  <div className="product-rating-summary">
                    {renderStars(selectedProduct.rating)}

                    <strong>{averageRating}</strong>

                    <span>({selectedProduct.numOfReviews || 0} reviews)</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="product-refresh-btn"
                  onClick={handleRefresh}
                  disabled={reviewsLoading}
                >
                  <FiRefreshCw
                    className={reviewsLoading ? "product-refresh-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            )}

            {/* REVIEWS */}
            <div className="product-reviews-card">
              <div className="product-reviews-card-header">
                <div>
                  <span className="product-reviews-table-eyebrow">
                    CUSTOMER FEEDBACK
                  </span>

                  <h2>Reviews</h2>
                </div>

                <span className="product-reviews-count">
                  {selectedProductReviews?.length || 0} reviews
                </span>
              </div>

              {selectedProductReviews?.length > 0 ? (
                <div className="product-review-list">
                  {selectedProductReviews.map((review) => (
                    <div className="product-review-item" key={review._id}>
                      <div className="product-review-main">
                        {/* CUSTOMER */}
                        <div className="product-review-customer">
                          <div className="product-review-avatar">
                            {review.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <h3>{review.name || "Unknown"}</h3>

                            <span>Customer</span>
                          </div>
                        </div>

                        {/* RATING */}
                        <div className="product-review-rating">
                          {renderStars(review.rating)}

                          <span>{review.rating}/5</span>
                        </div>
                      </div>

                      {/* COMMENT */}
                      <p className="product-review-comment">
                        {review.comment || "No comment provided."}
                      </p>

                      {/* ACTION */}
                      <div className="product-review-actions">
                        <button
                          type="button"
                          className="product-review-delete"
                          onClick={() =>
                            setDeleteReview({
                              reviewId: review._id,
                              customerName: review.name,
                            })
                          }
                        >
                          <FiTrash2 />
                          Delete Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="product-reviews-empty">
                  <div className="product-empty-icon">☆</div>

                  <h3>No reviews yet</h3>

                  <p>This product currently has no customer reviews.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteReview && (
        <div className="product-review-modal-overlay">
          <div className="product-review-delete-modal">
            <div className="product-delete-icon">
              <FiTrash2 />
            </div>

            <span className="product-delete-eyebrow">DELETE REVIEW</span>

            <h3>Delete this review?</h3>

            <p>
              You are about to delete the review from{" "}
              <strong>{deleteReview.customerName || "this customer"}</strong>.
            </p>

            <p className="product-delete-warning">
              The product's rating and review count will be recalculated
              automatically.
            </p>

            <div className="product-delete-actions">
              <button
                type="button"
                className="product-delete-cancel"
                onClick={() => setDeleteReview(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="product-delete-confirm"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviews;
