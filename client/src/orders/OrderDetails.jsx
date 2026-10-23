import React, { useEffect } from "react";
import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Loader from "../components/Loader";
import FitFeedbackForm from "../components/FitFeedbackForm";
import "./orderDetails.css";

import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeError, userGetAOrder } from "../features/order/orderSlice";
import { toast } from "react-toastify";

import { ArrowLeft, Printer, Truck, MapPin, Phone, Check } from "lucide-react";

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { order, isLoading, error } = useSelector((store) => store.order);

  useEffect(() => {
    if (orderId) {
      dispatch(userGetAOrder(orderId));
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Couldn't fetch the order");
      dispatch(removeError());
    }
  }, [dispatch, error]);

  const {
    shippingInfo = {},
    orderItems = [],
    paymentInfo = {},
    itemPrice = 0,
    paidAt,
    shippingPrice = 0,
    taxPrice = 0,
    totalPrice = 0,
  } = order || {};

  const paymentStatus =
    paymentInfo?.status === "captured" ? "Paid" : "Not Paid";

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString();
  };

  const getItemStatusClass = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (normalizedStatus === "delivered") {
      return "delivered";
    }

    if (normalizedStatus === "shipped") {
      return "shipped";
    }

    if (normalizedStatus === "cancelled") {
      return "cancelled";
    }

    return "processing";
  };

  const formatItemStatus = (status) => {
    if (!status) return "Processing";

    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <PageTitle title="Order Details" />
      <Header />

      <main className="th-order-summary-page">
        <div className="th-order-container">
          {/* Top Navigation */}
          <div className="th-top-nav-row">
            <div className="th-nav-left">
              <button
                type="button"
                className="th-back-btn"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={14} />
                <span>Back to Orders</span>
              </button>

              <span className="th-slash">/</span>
              <span className="th-crumb-label">ORDER DETAILS</span>
            </div>
          </div>

          {/* Hero */}
          <header className="th-hero-banner">
            <div>
              <div className="th-lot-eyebrow">
                <span className="th-bullet">•</span>
                <span>ORDER DETAILS</span>
                <span className="th-bullet">•</span>
                <span>THRIFTHUB</span>
              </div>

              <h1 className="th-order-title">
                Order <span className="th-order-hash">#{orderId}</span>
              </h1>

              <p className="th-order-meta">
                Order placed on {formatDate(paidAt)}
              </p>
            </div>

            <div className="th-hero-actions">
              <button
                type="button"
                className="th-btn-secondary-print"
                onClick={handlePrint}
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                className="th-btn-primary-shipping"
                onClick={() =>
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                  })
                }
              >
                <Truck size={15} />
                <span>Shipping Details</span>
              </button>
            </div>
          </header>

          {/* Order Items */}
          <section className="th-content-card">
            <div className="th-card-header">
              <h2 className="th-section-heading">
                <span className="th-dot">•</span>
                Order items
              </h2>

              <span className="th-items-count-badge">
                {orderItems.length} {orderItems.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            <div className="th-table-scroll">
              <table className="th-items-table">
                <thead>
                  <tr>
                    <th className="th-th-col th-col-img">IMAGE</th>
                    <th className="th-th-col th-col-name">NAME</th>
                    <th className="th-th-col th-col-qty">QUANTITY</th>
                    <th className="th-th-col th-col-price">PRICE</th>
                    <th className="th-th-col th-col-status">STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => {
                      const statusClass = getItemStatusClass(item.orderStatus);

                      const isDelivered =
                        item.orderStatus?.toLowerCase() === "delivered" &&
                        Boolean(item.deliveredAt);

                      return (
                        <React.Fragment key={item._id || item.product || index}>
                          {/* Existing product row */}
                          <tr className="th-item-tr">
                            {/* Image */}
                            <td className="th-td-col th-td-img">
                              <div className="th-img-wrapper">
                                <img
                                  src={item.image}
                                  alt={item.name || "Product"}
                                />
                              </div>
                            </td>

                            {/* Product */}
                            <td className="th-td-col th-td-name">
                              <div className="th-badges-row">
                                <span className="th-badge">ORDER ITEM</span>

                                {item.quantity && (
                                  <span className="th-badge verified">
                                    <Check size={11} />
                                    CONFIRMED
                                  </span>
                                )}
                              </div>

                              <h3 className="th-item-name-text">{item.name}</h3>

                              <p className="th-item-specs-text">
                                Quantity: {item.quantity}
                              </p>
                            </td>

                            {/* Quantity */}
                            <td className="th-td-col th-td-qty">
                              <span className="th-qty-pill-box">
                                {item.quantity}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="th-td-col th-td-price">
                              <span className="th-price-main">
                                {formatPrice(item.price)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="th-td-col th-td-status">
                              <span className={`th-item-status ${statusClass}`}>
                                <span className="th-item-status-dot" />
                                {formatItemStatus(item.orderStatus)}
                              </span>
                            </td>
                          </tr>

                          {/* Fit feedback row — only for delivered items */}
                          {isDelivered && (
                            <tr className="th-fit-feedback-row">
                              <td colSpan={5}>
                                <FitFeedbackForm
                                  orderId={order._id}
                                  item={item}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="th-empty-state">
                        No items found for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Shipping + Order Summary */}
          <div className="th-details-split-row">
            {/* Shipping Information */}
            <section className="th-content-card th-split-card">
              <div className="th-card-header">
                <h2 className="th-section-heading">
                  <span className="th-dot">•</span>
                  Shipping Info
                </h2>

                <span className="th-section-mini-label">DELIVERY</span>
              </div>

              <div className="th-shipping-cells-list">
                {/* Address */}
                <div className="th-info-tile">
                  <div className="th-tile-icon">
                    <MapPin size={18} />
                  </div>

                  <div className="th-tile-details">
                    <span className="th-tile-label">Address</span>

                    <strong className="th-tile-name">Shipping Address</strong>

                    <p className="th-tile-address">
                      {shippingInfo.address || "—"}

                      {shippingInfo.city && (
                        <>
                          <br />
                          {shippingInfo.city}
                        </>
                      )}

                      {shippingInfo.state && <>, {shippingInfo.state}</>}

                      {shippingInfo.country && (
                        <>
                          <br />
                          {shippingInfo.country}
                        </>
                      )}

                      {shippingInfo.pinCode && <> - {shippingInfo.pinCode}</>}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="th-info-tile">
                  <div className="th-tile-icon">
                    <Phone size={18} />
                  </div>

                  <div className="th-tile-details">
                    <span className="th-tile-label">Phone No</span>

                    <span className="th-tile-phone">
                      {shippingInfo.phoneNo || "—"}
                    </span>
                  </div>
                </div>

                {/* Item Status Information */}
                <div className="th-courier-banner">
                  <div className="th-courier-icon">
                    <Truck size={20} />
                  </div>

                  <div className="th-courier-text">
                    <strong>Order Shipping</strong>

                    <span>Each product has its own shipping status.</span>
                  </div>

                  <span className="th-priority-pill">
                    {orderItems.length}{" "}
                    {orderItems.length === 1 ? "ITEM" : "ITEMS"}
                  </span>
                </div>
              </div>
            </section>

            {/* Order Summary */}
            <section className="th-content-card th-split-card">
              <div className="th-card-header">
                <h2 className="th-section-heading">
                  <span className="th-dot">•</span>
                  Order summary
                </h2>

                <span
                  className={
                    paymentStatus === "Paid"
                      ? "th-escrow-badge th-summary-paid"
                      : "th-escrow-badge th-summary-unpaid"
                  }
                >
                  {paymentStatus === "Paid" && <Check size={14} />}
                  {paymentStatus.toUpperCase()}
                </span>
              </div>

              <div className="th-summary-table-wrap">
                {/* Payment */}
                <div className="th-summary-row">
                  <span className="th-summary-key">Payment</span>

                  <span
                    className={
                      paymentStatus === "Paid"
                        ? "th-tag-paid"
                        : "th-tag-not-paid"
                    }
                  >
                    {paymentStatus === "Paid" && (
                      <Check size={11} strokeWidth={3} />
                    )}

                    {paymentStatus.toUpperCase()}
                  </span>
                </div>

                {/* Paid At */}
                <div className="th-summary-row">
                  <span className="th-summary-key">Paid at</span>

                  <span className="th-summary-val font-mono">
                    {formatDate(paidAt)}
                  </span>
                </div>

                {/* Item Price */}
                <div className="th-summary-row">
                  <span className="th-summary-key">Item price</span>

                  <span className="th-summary-val font-mono">
                    {formatPrice(itemPrice)}
                  </span>
                </div>

                {/* Tax */}
                <div className="th-summary-row">
                  <span className="th-summary-key">Tax price</span>

                  <span className="th-summary-val font-mono">
                    {formatPrice(taxPrice)}
                  </span>
                </div>

                {/* Shipping */}
                <div className="th-summary-row">
                  <span className="th-summary-key">Shipping charges</span>

                  <span className="th-summary-val font-mono">
                    {formatPrice(shippingPrice)}
                  </span>
                </div>

                {/* Total */}
                <div className="th-summary-total-banner">
                  <span className="th-total-word">Total price</span>

                  <span className="th-total-digit">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderDetails;
