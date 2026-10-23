import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiEye, FiRefreshCw, FiSearch, FiTrash2 } from "react-icons/fi";

import {
  adminGetAllReviews,
  adminDeleteReview,
  removeErrors,
} from "../features/admin/adminSlice";

import PageTitle from "../../../client/src/components/PageTitle";
import Loader from "../../../client/src/components/Loader";
import Pagination from "../components/pagination/Pagination";
import "../styles/reviews.css";

const Reviews = () => {
  const dispatch = useDispatch();

  const {
    reviews,
    reviewCount,
    resultPerPage,
    totalPages,
    currentPage,
    reviewsLoading,
    actionLoading,
    error,
  } = useSelector((state) => state.admin);

  const [page, setPage] = useState(currentPage || 1);
  const [search, setSearch] = useState("");
  const [deleteReview, setDeleteReview] = useState(null);

  useEffect(() => {
    dispatch(adminGetAllReviews(page));

    return () => {
      dispatch(removeErrors());
    };
  }, [dispatch, page]);

  console.log(reviews);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefresh = () => {
    dispatch(adminGetAllReviews(page));
  };

  const handleDelete = async () => {
    if (!deleteReview) return;

    await dispatch(
      adminDeleteReview({
        productId: deleteReview.productId,
        reviewId: deleteReview.reviewId,
      }),
    );

    setDeleteReview(null);
  };

  const filteredReviews = reviews?.filter((review) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      review.name?.toLowerCase().includes(keyword) ||
      review.comment?.toLowerCase().includes(keyword) ||
      review.product?.name?.toLowerCase().includes(keyword)
    );
  });

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star active" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <PageTitle title="Reviews" />

      <div className="reviews-page">
        {/* HEADER */}
        <div className="reviews-header">
          <div>
            <span className="reviews-eyebrow">CUSTOMER FEEDBACK</span>

            <h1>Reviews</h1>

            <p>
              Monitor customer feedback and manage product reviews across
              ThriftHub.
            </p>
          </div>
        </div>

        {/* STAT */}
        <div className="reviews-stat-card">
          <span className="reviews-stat-label">TOTAL REVIEWS</span>

          <strong>{reviewCount || 0}</strong>
        </div>

        {/* TOOLBAR */}
        <div className="reviews-toolbar">
          <div className="reviews-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search customer, product or review..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="reviews-refresh-btn"
            onClick={handleRefresh}
            disabled={reviewsLoading}
          >
            <FiRefreshCw className={reviewsLoading ? "refresh-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && <div className="reviews-error">{error}</div>}

        {/* TABLE */}
        <div className="reviews-card">
          <div className="reviews-card-header">
            <div>
              <span className="reviews-table-eyebrow">CUSTOMER REVIEWS</span>

              <h2>Review List</h2>
            </div>

            <span className="reviews-count">{reviewCount || 0} reviews</span>
          </div>

          {reviewsLoading ? (
            <div className="reviews-loader">
              <Loader />
            </div>
          ) : filteredReviews?.length > 0 ? (
            <div className="reviews-table-wrapper">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>PRODUCT</th>
                    <th>RATING</th>
                    <th>REVIEW</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review._id}>
                      {/* CUSTOMER */}
                      <td>
                        <div className="review-customer">
                          <div className="customer-avatar">
                            {review.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <span className="customer-name">
                              {review.name || "Unknown"}
                            </span>

                            <span className="customer-label">Customer</span>
                          </div>
                        </div>
                      </td>

                      {/* PRODUCT */}
                      <td>
                        <Link
                          to={`/reviews/product/${review.product?._id}`}
                          className="review-product"
                        >
                          <div className="review-product-image">
                            {review.product?.image ? (
                              <img
                                src={review.product.image}
                                alt={review.product.name}
                              />
                            ) : (
                              <span>No Image</span>
                            )}
                          </div>

                          <span className="review-product-name">
                            {review.product?.name || "Unknown product"}
                          </span>
                        </Link>
                      </td>

                      {/* RATING */}
                      <td>
                        <div className="rating-wrapper">
                          {renderStars(Number(review.rating) || 0)}

                          <span className="rating-number">
                            {review.rating}/5
                          </span>
                        </div>
                      </td>

                      {/* COMMENT */}
                      <td>
                        <p className="review-comment">
                          {review.comment || "No comment"}
                        </p>
                      </td>

                      {/* ACTION */}
                      <td>
                        <div className="review-actions">
                          <Link
                            to={`/reviews/product/${review.product?._id}`}
                            className="review-view-btn"
                            title="View product reviews"
                          >
                            <FiEye />
                          </Link>

                          <button
                            type="button"
                            className="review-delete-btn"
                            title="Delete review"
                            onClick={() =>
                              setDeleteReview({
                                reviewId: review._id,
                                productId: review.product?._id,
                                customerName: review.name,
                                productName: review.product?.name,
                              })
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="reviews-empty">
              <div className="empty-icon">☆</div>

              <h3>No reviews found</h3>

              <p>There are no reviews matching your current search.</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!reviewsLoading && totalPages > 1 && (
          <div className="reviews-pagination">
            <Pagination
              currentPage={currentPage || page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteReview && (
        <div className="review-modal-overlay">
          <div className="review-delete-modal">
            <div className="delete-modal-icon">
              <FiTrash2 />
            </div>

            <span className="delete-modal-eyebrow">DELETE REVIEW</span>

            <h3>Delete this review?</h3>

            <p>
              You are about to delete{" "}
              <strong>{deleteReview.customerName}</strong>'s review on{" "}
              <strong>{deleteReview.productName}</strong>.
            </p>

            <p className="delete-warning">
              This will also recalculate the product rating and review count.
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={() => setDeleteReview(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-btn"
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

export default Reviews;
