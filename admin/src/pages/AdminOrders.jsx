import React, { useEffect, useState } from "react";
import { Eye, Package, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../../../client/src/components/Loader";
import Pagination from "../components/pagination/Pagination";

import { adminGetAllOrders, removeErrors } from "../features/admin/adminSlice";

import "../styles/adminOrders.css";

const AdminOrders = () => {
  const dispatch = useDispatch();

  const {
    orders = [],
    ordersLoading,
    error,
    orderCount = 0,
    resultPerPage = 6,
    totalPages = 0,
    currentPage = 1,
  } = useSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      adminGetAllOrders({
        keyword: searchQuery,
        page,
      }),
    );
  }, [dispatch, searchQuery, page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    dispatch(
      adminGetAllOrders({
        keyword: searchQuery,
        page,
      }),
    );
  };

  const getOverallStatus = (orderItems = []) => {
    if (!orderItems.length) return "processing";

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
      case "delivered":
        return "status-delivered";

      case "shipped":
        return "status-shipped";

      case "partially shipped":
        return "status-partial";

      case "cancelled":
        return "status-cancelled";

      default:
        return "status-processing";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Processing";

    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getItemsCount = (orderItems = []) => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <span className="admin-orders-eyebrow">ORDER MANAGEMENT</span>

          <h1>Orders</h1>

          <p>
            Review customer orders and manage delivery status across the
            marketplace.
          </p>
        </div>

        <div className="admin-orders-header-count">
          <Package size={16} />
          <span>{orderCount} total orders</span>
        </div>
      </div>

      <div className="admin-orders-toolbar">
        <div className="admin-orders-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <button
          className="admin-orders-refresh"
          onClick={handleRefresh}
          disabled={ordersLoading}
        >
          <RefreshCw
            size={15}
            className={ordersLoading ? "admin-refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {ordersLoading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="admin-orders-empty">
          <div className="admin-orders-empty-icon">
            <Package size={22} />
          </div>

          <h3>No orders found</h3>

          <p>There are no orders matching your current search.</p>
        </div>
      ) : (
        <div className="admin-orders-card">
          <div className="admin-orders-card-header">
            <div>
              <span>MARKETPLACE ORDERS</span>
              <h2>Recent Orders</h2>
            </div>

            <p>
              Showing {orders.length} of {orderCount}
            </p>
          </div>

          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const overallStatus = getOverallStatus(order.orderItems);

                  return (
                    <tr key={order._id}>
                      <td>
                        <div className="admin-order-id">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>

                        <div className="admin-order-payment">
                          {order.paymentInfo?.status || "Paid"}
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-customer">
                          {order.user?.username || "Unknown customer"}
                        </div>

                        <div className="admin-order-email">
                          {order.user?.email || "—"}
                        </div>
                      </td>

                      <td>
                        <span className="admin-order-items">
                          {getItemsCount(order.orderItems)}{" "}
                          {getItemsCount(order.orderItems) === 1
                            ? "item"
                            : "items"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-total">
                          ₹
                          {Number(order.totalPrice || 0).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-order-status ${getStatusClass(
                            overallStatus,
                          )}`}
                        >
                          <span className="status-dot" />
                          {formatStatus(overallStatus)}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-date">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      <td>
                        <Link
                          to={`/order/${order._id}`}
                          className="admin-order-view"
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

          {totalPages > 1 && (
            <div className="admin-orders-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
