import React, { useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PageTitle from "../../components/PageTitle";
import Loader from "../../components/Loader";

import {
  sellerSingleOrder,
  sellerUpdateOrderStatus,
  clearSelectedOrder,
  removeErrors,
  removeSuccess,
} from "../../features/seller/sellerSlice";

import "./sellerOrderDetails.css";
import Header from "../../components/header/Header";

const SellerOrderDetails = () => {
  const { orderId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, isLoading, actionLoading, error, isSuccess } = useSelector(
    (state) => state.seller,
  );

  useEffect(() => {
    if (orderId) {
      dispatch(sellerSingleOrder(orderId));
    }

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Order item marked as shipped");
      dispatch(removeSuccess());
    }
  }, [dispatch, isSuccess]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Processing";

    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "shipped":
        return "shipped";

      case "delivered":
        return "delivered";

      case "cancelled":
        return "cancelled";

      default:
        return "processing";
    }
  };

  const handleMarkAsShipped = (itemId) => {
    if (!orderId || !itemId) return;

    dispatch(
      sellerUpdateOrderStatus({
        orderId,
        itemId,
        orderStatus: "shipped",
      }),
    );
  };

  if (isLoading && !order) {
    return (
      <div className="seller-order-details-loader">
        <Loader />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="seller-order-details-empty">
        <Package size={30} />

        <h2>Order not found</h2>

        <p>
          This order could not be found or you are not authorized to view it.
        </p>

        <button onClick={() => navigate("/seller/orders")}>
          Back to Orders
        </button>
      </div>
    );
  }

  const {
    shippingInfo = {},
    orderItems = [],
    paymentInfo = {},
    itemsPrice = 0,
    paidAt,
    createdAt,
  } = order;

  const sellerItemsTotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <>
      <Header />
      <PageTitle title="Order Details" />

      <div className="seller-order-details-page">
        {/* =========================
            TOP
        ========================= */}

        <div className="seller-order-details-top">
          <div>
            <Link to="/seller/orders" className="seller-back-link">
              <ArrowLeft size={15} />
              Back to Orders
            </Link>

            <span className="seller-details-eyebrow">ORDER DETAILS</span>

            <h1>#{order._id?.slice(-8).toUpperCase()}</h1>

            <p>Placed on {formatDate(createdAt)}</p>
          </div>

          <div className="seller-details-payment">
            <span className="seller-payment-label">PAYMENT</span>

            <span className="seller-payment-status">
              <CheckCircle2 size={14} />

              {paymentInfo?.status === "captured" ? "Paid" : "Not Paid"}
            </span>
          </div>
        </div>

        {/* =========================
            ORDER ITEMS
        ========================= */}

        <section className="seller-details-card">
          <div className="seller-details-card-header">
            <div>
              <span className="seller-card-eyebrow">YOUR PRODUCTS</span>

              <h2>Order Items</h2>
            </div>

            <span className="seller-item-total-count">
              {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="seller-order-items">
            {orderItems.map((item) => {
              const statusClass = getStatusClass(item.orderStatus);

              const isProcessing = item.orderStatus === "processing";

              const isUpdating =
                actionLoading && item.orderStatus === "processing";

              return (
                <div className="seller-order-item" key={item._id}>
                  <div className="seller-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="seller-item-main">
                    <h3>{item.name}</h3>

                    <div className="seller-item-meta">
                      <span>Qty: {item.quantity}</span>

                      <span>₹{Number(item.price).toLocaleString("en-IN")}</span>
                    </div>

                    <div className="seller-item-status-row">
                      <span className={`seller-item-status ${statusClass}`}>
                        <span className="seller-item-status-dot" />

                        {formatStatus(item.orderStatus)}
                      </span>

                      {item.shippedAt && (
                        <span className="seller-item-time">
                          Shipped {formatDateTime(item.shippedAt)}
                        </span>
                      )}

                      {item.deliveredAt && (
                        <span className="seller-item-time">
                          Delivered {formatDateTime(item.deliveredAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="seller-item-actions">
                    <strong>
                      ₹
                      {Number(item.price * item.quantity).toLocaleString(
                        "en-IN",
                      )}
                    </strong>

                    {isProcessing && (
                      <button
                        className="seller-ship-btn"
                        onClick={() => handleMarkAsShipped(item._id)}
                        disabled={actionLoading}
                      >
                        <Truck size={14} />

                        {isUpdating ? "Updating..." : "Mark as Shipped"}
                      </button>
                    )}

                    {item.orderStatus === "shipped" && (
                      <span className="seller-shipped-confirm">
                        <CheckCircle2 size={14} />
                        Shipped
                      </span>
                    )}

                    {item.orderStatus === "delivered" && (
                      <span className="seller-delivered-confirm">
                        <CheckCircle2 size={14} />
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================
            CUSTOMER / SHIPPING
        ========================= */}

        <div className="seller-details-grid">
          <section className="seller-details-card">
            <div className="seller-details-card-header">
              <div>
                <span className="seller-card-eyebrow">CUSTOMER</span>

                <h2>Shipping Information</h2>
              </div>
            </div>

            <div className="seller-shipping-content">
              <div className="seller-info-icon">
                <User size={17} />
              </div>

              <div>
                <strong>Customer Address</strong>

                <p>{shippingInfo.address}</p>

                <p>
                  {shippingInfo.city}, {shippingInfo.state}
                </p>

                <p>
                  {shippingInfo.country} - {shippingInfo.pinCode}
                </p>

                <p>Phone: {shippingInfo.phoneNo}</p>
              </div>
            </div>
          </section>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <section className="seller-details-card">
            <div className="seller-details-card-header">
              <div>
                <span className="seller-card-eyebrow">SUMMARY</span>

                <h2>Your Order</h2>
              </div>
            </div>

            <div className="seller-summary-list">
              <div>
                <span>Payment</span>

                <strong>
                  {paymentInfo?.status === "captured" ? "Paid" : "Not Paid"}
                </strong>
              </div>

              <div>
                <span>Paid At</span>

                <strong>{formatDateTime(paidAt)}</strong>
              </div>

              <div>
                <span>Your Items</span>

                <strong>{orderItems.length}</strong>
              </div>

              <div>
                <span>Your Items Total</span>

                <strong>
                  ₹{Number(sellerItemsTotal).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            <div className="seller-summary-note">
              <MapPin size={14} />

              <span>Shipping and delivery status is managed per product.</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SellerOrderDetails;
