import React, { useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Store,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../../../client/src/components/Loader";

import {
  adminGetSingleOrder,
  adminUpdateOrderStatus,
  clearSelectedOrder,
  removeErrors,
} from "../features/admin/adminSlice";

import "../styles/adminOrderDetails.css";

const AdminOrderDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orderId } = useParams();

  const { selectedOrder, ordersLoading, actionLoading, error } = useSelector(
    (state) => state.admin,
  );

  useEffect(() => {
    if (orderId) {
      dispatch(adminGetSingleOrder(orderId));
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

  const handleMarkAsDelivered = (itemId) => {
    dispatch(
      adminUpdateOrderStatus({
        orderId,
        itemId,
        orderStatus: "delivered",
      }),
    )
      .unwrap()
      .then((response) => {
        toast.success(response.message || "Order item marked as delivered");
      })
      .catch(() => {});
  };

  const formatStatus = (status) => {
    if (!status) return "Processing";

    return status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "admin-detail-status-delivered";

      case "shipped":
        return "admin-detail-status-shipped";

      case "cancelled":
        return "admin-detail-status-cancelled";

      default:
        return "admin-detail-status-processing";
    }
  };

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

  if (ordersLoading) {
    return (
      <div className="admin-order-details-page">
        <Loader />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-not-found">
          <Package size={24} />

          <h2>Order not found</h2>

          <p>The order you're looking for could not be found.</p>

          <button onClick={() => navigate("/admin/orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = selectedOrder;

  const deliveredCount = order.orderItems.filter(
    (item) => item.orderStatus === "delivered",
  ).length;

  const shippedCount = order.orderItems.filter(
    (item) => item.orderStatus === "shipped",
  ).length;

  const processingCount = order.orderItems.filter(
    (item) => item.orderStatus === "processing",
  ).length;

  return (
    <div className="admin-order-details-page">
      {/* ----------------------------------------------------
          Header
      ---------------------------------------------------- */}

      <div className="admin-order-details-header">
        <div>
          <button className="admin-order-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
            Back to Orders
          </button>

          <span className="admin-order-details-eyebrow">ORDER MANAGEMENT</span>

          <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>

          <p>Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="admin-order-details-payment">
          <CreditCard size={14} />

          <span>{order.paymentInfo?.status || "Paid"}</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          Order progress summary
      ---------------------------------------------------- */}

      <div className="admin-order-progress">
        <div className="admin-order-progress-item">
          <span className="admin-progress-number">
            {order.orderItems.length}
          </span>

          <span>Items</span>
        </div>

        <div className="admin-order-progress-divider" />

        <div className="admin-order-progress-item">
          <span className="admin-progress-number">{processingCount}</span>

          <span>Processing</span>
        </div>

        <div className="admin-order-progress-divider" />

        <div className="admin-order-progress-item">
          <span className="admin-progress-number">{shippedCount}</span>

          <span>Shipped</span>
        </div>

        <div className="admin-order-progress-divider" />

        <div className="admin-order-progress-item">
          <span className="admin-progress-number">{deliveredCount}</span>

          <span>Delivered</span>
        </div>
      </div>

      {/* ----------------------------------------------------
          Customer
      ---------------------------------------------------- */}

      <div className="admin-order-info-grid">
        <section className="admin-order-info-card">
          <div className="admin-order-card-title">
            <div className="admin-order-card-icon">
              <User size={15} />
            </div>

            <div>
              <span>CUSTOMER</span>
              <h2>Customer Information</h2>
            </div>
          </div>

          <div className="admin-order-info-content">
            <div>
              <label>Name</label>
              <p>{order.user?.username || "—"}</p>
            </div>

            <div>
              <label>Email</label>
              <p>{order.user?.email || "—"}</p>
            </div>
          </div>
        </section>

        <section className="admin-order-info-card">
          <div className="admin-order-card-title">
            <div className="admin-order-card-icon">
              <CreditCard size={15} />
            </div>

            <div>
              <span>PAYMENT</span>
              <h2>Payment Information</h2>
            </div>
          </div>

          <div className="admin-order-info-content">
            <div>
              <label>Status</label>
              <p className="admin-payment-status">
                {order.paymentInfo?.status || "Paid"}
              </p>
            </div>

            <div>
              <label>Payment ID</label>
              <p className="admin-payment-id">{order.paymentInfo?.id || "—"}</p>
            </div>

            <div>
              <label>Paid At</label>
              <p>{formatDateTime(order.paidAt)}</p>
            </div>
          </div>
        </section>
      </div>

      {/* ----------------------------------------------------
          Products
      ---------------------------------------------------- */}

      <section className="admin-order-items-card">
        <div className="admin-order-items-header">
          <div>
            <span>ORDER ITEMS</span>
            <h2>Products in this Order</h2>
          </div>

          <p>
            {order.orderItems.length}{" "}
            {order.orderItems.length === 1 ? "product" : "products"}
          </p>
        </div>

        <div className="admin-order-items-list">
          {order.orderItems.map((item) => {
            const status = item.orderStatus || "processing";

            const canDeliver = status === "shipped";

            return (
              <div className="admin-order-item" key={item._id}>
                <div className="admin-order-product-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="admin-order-product-main">
                  <h3>{item.name}</h3>

                  <div className="admin-order-product-meta">
                    <span>Quantity: {item.quantity}</span>

                    <span>
                      Price: ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="admin-order-seller">
                    <Store size={13} />

                    <span>
                      Seller:{" "}
                      <strong>
                        {item.seller?.storeName || "Unknown seller"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="admin-order-product-status">
                  <span
                    className={`admin-detail-status ${getStatusClass(status)}`}
                  >
                    <span className="admin-detail-status-dot" />
                    {formatStatus(status)}
                  </span>

                  {item.shippedAt && (
                    <small>Shipped {formatDateTime(item.shippedAt)}</small>
                  )}

                  {item.deliveredAt && (
                    <small>Delivered {formatDateTime(item.deliveredAt)}</small>
                  )}
                </div>

                <div className="admin-order-product-action">
                  {canDeliver ? (
                    <button
                      className="admin-deliver-btn"
                      onClick={() => handleMarkAsDelivered(item._id)}
                      disabled={actionLoading}
                    >
                      <Truck size={14} />

                      {actionLoading ? "Updating..." : "Mark as Delivered"}
                    </button>
                  ) : status === "delivered" ? (
                    <div className="admin-delivered-confirmation">
                      <CheckCircle2 size={15} />
                      Delivered
                    </div>
                  ) : (
                    <span className="admin-awaiting-seller">
                      Awaiting seller shipment
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------
          Shipping + Summary
      ---------------------------------------------------- */}

      <div className="admin-order-bottom-grid">
        <section className="admin-order-info-card">
          <div className="admin-order-card-title">
            <div className="admin-order-card-icon">
              <MapPin size={15} />
            </div>

            <div>
              <span>DELIVERY</span>
              <h2>Shipping Information</h2>
            </div>
          </div>

          <div className="admin-shipping-content">
            <div className="admin-shipping-row">
              <MapPin size={14} />

              <div>
                <label>Address</label>
                <p>{order.shippingInfo?.address}</p>
              </div>
            </div>

            <div className="admin-shipping-row">
              <div className="admin-shipping-placeholder" />

              <div>
                <label>Location</label>
                <p>
                  {order.shippingInfo?.city}, {order.shippingInfo?.state},{" "}
                  {order.shippingInfo?.country}
                </p>
              </div>
            </div>

            <div className="admin-shipping-row">
              <Phone size={14} />

              <div>
                <label>Phone</label>
                <p>{order.shippingInfo?.phoneNo || "—"}</p>
              </div>
            </div>

            <div className="admin-shipping-row">
              <div className="admin-shipping-placeholder" />

              <div>
                <label>PIN Code</label>
                <p>{order.shippingInfo?.pinCode || "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-order-summary-card">
          <div className="admin-order-card-title">
            <div className="admin-order-card-icon">
              <Package size={15} />
            </div>

            <div>
              <span>SUMMARY</span>
              <h2>Order Total</h2>
            </div>
          </div>

          <div className="admin-order-summary-lines">
            <div>
              <span>Items Price</span>
              <strong>
                ₹{Number(order.itemPrice || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Tax</span>
              <strong>
                ₹{Number(order.taxPrice || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Shipping</span>
              <strong>
                ₹{Number(order.shippingPrice || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="admin-order-summary-total">
            <span>Total</span>

            <strong>
              ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
