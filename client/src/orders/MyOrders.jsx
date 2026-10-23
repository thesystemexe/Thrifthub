import React, { useState, useEffect } from "react";
import { ExternalLink, Search, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Loader from "../components/Loader";

import { removeError, userGetAllMyOrders } from "../features/order/orderSlice";
import "./myOrders.css";

const MyOrders = () => {
  const { orders, isLoading, error } = useSelector((store) => store.order);
  const dispatch = useDispatch();

  console.log(orders);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(userGetAllMyOrders());
    if (error) {
      toast.error(error || "Error occurred fetching orders");
      dispatch(removeError());
    }
  }, [dispatch, error]);

  const getOrderStatus = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === "delivered" || normalizedStatus === "completed") {
      return "completed";
    }
    if (
      normalizedStatus === "shipped" ||
      normalizedStatus === "partially shipped" ||
      normalizedStatus === "out for delivery" ||
      normalizedStatus === "in transit"
    ) {
      return "transit";
    }
    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled" ||
      normalizedStatus === "returned"
    ) {
      return "returns";
    }
    return "active";
  };

  const getOverallStatus = (orderItems = []) => {
    if (!orderItems.length) {
      return "processing";
    }

    const statuses = orderItems.map(
      (item) => item.orderStatus?.toLowerCase() || "processing",
    );

    // Every product is delivered
    if (statuses.every((status) => status === "delivered")) {
      return "delivered";
    }

    // Every product is cancelled
    if (statuses.every((status) => status === "cancelled")) {
      return "cancelled";
    }

    // Some products are delivered/shipped and some are still processing
    const hasDelivered = statuses.includes("delivered");
    const hasShipped = statuses.includes("shipped");
    const hasProcessing = statuses.includes("processing");

    if ((hasDelivered || hasShipped) && hasProcessing) {
      return "partially shipped";
    }

    // All remaining products are shipped/delivered
    if (statuses.every((status) => ["shipped", "delivered"].includes(status))) {
      return "shipped";
    }

    // Default
    return "processing";
  };

  const filteredOrders = orders.filter((order) => {
    const overallStatus = getOverallStatus(order.orderItems);
    const statusType = getOrderStatus(overallStatus);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "transit" && statusType === "transit") ||
      (activeTab === "completed" && statusType === "completed") ||
      (activeTab === "returns" && statusType === "returns") ||
      (activeTab === "active" && statusType === "active");

    const searchValue = searchQuery.toLowerCase();

    const matchesSearch =
      order._id?.toLowerCase().includes(searchValue) ||
      overallStatus?.toLowerCase().includes(searchValue);

    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <PageTitle title="User orders" />
      <Header />
      <div className="th-orders-page">
        {/* Header Section */}
        <section className="th-orders-header">
          <div className="th-orders-container">
            <div className="th-header-main">
              <div className="th-vault-tag">
                <ShoppingBag size={14} />
                <span>YOUR THRIFTHUB PURCHASES</span>
              </div>
              <h1 className="th-orders-title">My Purchases & Order History</h1>
              <p className="th-orders-subtitle">
                View your purchases, check order status, and access your order
                details.
              </p>
            </div>

            {/* Tabs */}
            <div className="th-orders-tabs-row">
              <div className="th-orders-tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`th-tab-btn ${
                    activeTab === "all" ? "active" : ""
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`th-tab-btn ${
                    activeTab === "active" ? "active" : ""
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transit")}
                  className={`th-tab-btn ${
                    activeTab === "transit" ? "active" : ""
                  }`}
                >
                  In Transit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("completed")}
                  className={`th-tab-btn ${
                    activeTab === "completed" ? "active" : ""
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("returns")}
                  className={`th-tab-btn ${
                    activeTab === "returns" ? "active" : ""
                  }`}
                >
                  Returns / Cancelled
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="th-search-toolbar">
              <div className="th-orders-search-box">
                <Search size={16} className="th-search-icon" />
                <input
                  type="text"
                  placeholder="Search by order ID or order status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="th-orders-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="th-orders-container">
          {orders.length === 0 ? (
            <div className="th-empty-orders">
              <div className="th-empty-icon">
                <ShoppingBag size={30} />
              </div>
              <h2>No orders yet</h2>
              <p>
                Your completed purchases will appear here once you place an
                order.
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="th-empty-orders">
              <div className="th-empty-icon">
                <Search size={28} />
              </div>
              <h2>No matching orders</h2>
              <p>Try changing your search or selecting another filter.</p>
              <button
                type="button"
                className="th-btn-primary-filter"
                onClick={() => {
                  setActiveTab("all");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <section className="th-orders-stream">
              {filteredOrders.map((order) => {
                const overallStatus = getOverallStatus(order.orderItems);
                const statusType = getOrderStatus(overallStatus);
                return (
                  <article key={order._id} className="th-order-card">
                    {/* Order Header */}
                    <header className="th-order-card-header">
                      <div className="th-header-meta-left">
                        <strong className="th-order-num">
                          Order #{order._id}
                        </strong>
                        <span className="th-bullet">•</span>
                        <span className="th-item-count">
                          {order.orderItems.length}{" "}
                          {order.orderItems.length === 1 ? "Item" : "Items"}
                        </span>
                      </div>
                      <div className="th-header-meta-right">
                        <span className={`th-status-pill ${statusType}`}>
                          <span className="th-status-dot"></span>
                          {overallStatus}
                        </span>
                      </div>
                    </header>

                    {/* Order Body */}
                    <div className="th-order-body">
                      <div className="th-order-info-grid">
                        <div className="th-order-info-block">
                          <span className="th-info-label">ORDER ID</span>
                          <strong>{order._id}</strong>
                        </div>
                        <div className="th-order-info-block">
                          <span className="th-info-label">ITEMS</span>
                          <strong>
                            {order.orderItems.length}{" "}
                            {order.orderItems.length === 1
                              ? "Product"
                              : "Products"}
                          </strong>
                        </div>
                        <div className="th-order-info-block">
                          <span className="th-info-label">STATUS</span>
                          <strong className="th-status-text">
                            {overallStatus}
                          </strong>
                        </div>
                        <div className="th-order-info-block total">
                          <span className="th-info-label">TOTAL PRICE</span>
                          <strong>₹{order.totalPrice}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <footer className="th-order-footer">
                      <div className="th-order-footer-left">
                        <span className="th-footer-label">ORDER DETAILS</span>
                        <span className="th-footer-text">
                          View products, shipping information and order status.
                        </span>
                      </div>
                      <Link
                        to={`/order/${order._id}`}
                        className="th-btn-secondary-view"
                      >
                        <span>View Order</span>
                        <ExternalLink size={14} />
                      </Link>
                    </footer>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
