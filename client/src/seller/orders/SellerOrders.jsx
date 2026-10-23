import React, { useEffect, useState } from "react";
import { Eye, Package, Search, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Header from "../../components/header/Header";

import PageTitle from "../../components/PageTitle";
import Loader from "../../components/Loader";

import { sellerOrders, removeErrors } from "../../features/seller/sellerSlice";

import "./sellerOrders.css";
import Footer from "../../components/footer/Footer";

const SellerOrders = () => {
  const dispatch = useDispatch();

  const {
    orders = [],
    isLoading,
    error,
    orderCount = 0,
    resultPerPage = 6,
    totalPages = 0,
    currentPage = 1,
  } = useSelector((state) => state.seller);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(
      sellerOrders({
        keyword: searchQuery,
        page: 1,
      }),
    );
  }, [dispatch, searchQuery]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const getOverallStatus = (orderItems = []) => {
    if (!orderItems.length) {
      return "processing";
    }

    const statuses = orderItems.map(
      (item) => item.orderStatus?.toLowerCase() || "processing",
    );

    if (statuses.every((status) => status === "delivered")) {
      return "delivered";
    }

    if (statuses.every((status) => status === "cancelled")) {
      return "cancelled";
    }

    const hasDelivered = statuses.includes("delivered");
    const hasShipped = statuses.includes("shipped");
    const hasProcessing = statuses.includes("processing");

    if ((hasDelivered || hasShipped) && hasProcessing) {
      return "partially shipped";
    }

    if (statuses.every((status) => ["shipped", "delivered"].includes(status))) {
      return "shipped";
    }

    return "processing";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "shipped":
        return "shipped";

      case "delivered":
        return "delivered";

      case "partially shipped":
        return "partial";

      case "cancelled":
        return "cancelled";

      default:
        return "processing";
    }
  };

  const formatStatus = (status) => {
    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePageChange = (page) => {
    dispatch(
      sellerOrders({
        keyword: searchQuery,
        page,
      }),
    );
  };

  return (
    <>
      <Header />
      <PageTitle title="Seller Orders" />

      <div className="seller-orders-page">
        <div className="seller-orders-header">
          <div>
            <span className="seller-orders-eyebrow">ORDER MANAGEMENT</span>

            <h1>Orders</h1>

            <p>
              Manage orders containing your products and track their shipping
              status.
            </p>
          </div>

          <button
            className="seller-refresh-btn"
            onClick={() =>
              dispatch(
                sellerOrders({
                  keyword: searchQuery,
                  page: currentPage,
                }),
              )
            }
            disabled={isLoading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="seller-orders-toolbar">
          <div className="seller-orders-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="seller-orders-count">
            <Package size={15} />
            <span>{orderCount} orders</span>
          </div>
        </div>

        {isLoading ? (
          <div className="seller-orders-loader">
            <Loader />
          </div>
        ) : orders.length === 0 ? (
          <div className="seller-orders-empty">
            <div className="seller-empty-icon">
              <Package size={28} />
            </div>

            <h2>No orders found</h2>

            <p>Orders containing your products will appear here.</p>
          </div>
        ) : (
          <>
            <div className="seller-orders-card">
              <div className="seller-orders-card-top">
                <div>
                  <span className="seller-table-eyebrow">SELLER ORDERS</span>

                  <h2>Recent Orders</h2>
                </div>

                <span className="seller-table-count">{orderCount} total</span>
              </div>

              <div className="seller-orders-table-wrapper">
                <table className="seller-orders-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>ITEMS</th>
                      <th>SELLER TOTAL</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => {
                      const overallStatus = getOverallStatus(order.orderItems);

                      const statusClass = getStatusClass(overallStatus);

                      return (
                        <tr key={order._id}>
                          <td>
                            <div className="seller-order-id">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>

                            <div className="seller-order-full-id">
                              {order._id}
                            </div>
                          </td>

                          <td>
                            <div className="seller-item-count">
                              {order.orderItems?.length || 0}{" "}
                              {order.orderItems?.length === 1
                                ? "item"
                                : "items"}
                            </div>
                          </td>

                          <td>
                            <strong className="seller-order-price">
                              ₹
                              {Number(order.itemsPrice || 0).toLocaleString(
                                "en-IN",
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`seller-status-pill ${statusClass}`}
                            >
                              <span className="seller-status-dot" />

                              {formatStatus(overallStatus)}
                            </span>
                          </td>

                          <td>
                            <span className="seller-order-date">
                              {formatDate(order.createdAt)}
                            </span>
                          </td>

                          <td>
                            <Link
                              to={`/seller/order/${order._id}`}
                              className="seller-view-btn"
                            >
                              <Eye size={14} />
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="seller-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SellerOrders;
