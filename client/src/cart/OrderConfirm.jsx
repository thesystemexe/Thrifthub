import React from "react";
import { CheckCircle2, Edit3, MapPin, Phone, ShoppingBag } from "lucide-react";
import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CheckoutPath from "./CheckoutPath";
import { useSelector } from "react-redux";
import "./orderConfirm.css";
import { useNavigate } from "react-router-dom";

const OrderConfirm = () => {
  const { shippingInfo, cartItems } = useSelector((store) => store.cart);
  const { user } = useSelector((store) => store.auth);
  const subTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product?.price || 0) * item.quantity,
    0,
  );

  const tax = Math.ceil(subTotal * 0.18);
  const shipping = subTotal > 500 ? 0 : 50;
  const total = subTotal + tax + shipping;

  const navigate = useNavigate();

  const proceedToPayment = () => {
    const data = {
      subTotal,
      tax,
      shipping,
      total,
    };
    sessionStorage.setItem("orderItem", JSON.stringify(data));
    navigate("/process/payment");
  };

  return (
    <>
      <PageTitle title="Order Confirmation" />

      <Header />

      <CheckoutPath activePath={1} />

      <main className="th-confirm-page">
        <div className="th-confirm-container">
          {/* Header */}
          <div className="th-confirm-header-row">
            <div>
              <div className="th-eyebrow-tag">
                <CheckCircle2 size={14} />
                <span>STEP 02 — ORDER REVIEW</span>
              </div>

              <h1 className="th-confirm-title">Review Your Order</h1>

              <p className="th-confirm-description">
                Check your shipping details and cart items before continuing to
                payment.
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="th-confirm-grid">
            {/* LEFT COLUMN */}
            <div className="th-confirm-left-col">
              {/* Shipping Details */}
              <section className="th-review-card">
                <div className="th-card-header">
                  <div className="th-card-title-group">
                    <div className="th-icon-bubble">
                      <MapPin size={18} />
                    </div>

                    <h2 className="th-card-heading">Shipping Details</h2>
                  </div>

                  <button
                    type="button"
                    className="th-link-edit"
                    onClick={() => navigate("/shipping")}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="th-shipping-boxes-grid">
                  {/* Recipient */}
                  <div className="th-subbox">
                    <span className="th-subbox-label">RECIPIENT</span>

                    <div className="th-recipient-name">
                      <strong>{user?.username}</strong>
                      <CheckCircle2 size={14} />
                    </div>

                    <p className="th-subbox-text">
                      {shippingInfo?.address}
                      <br />
                      {shippingInfo?.city}, {shippingInfo?.state}
                      <br />
                      {shippingInfo?.country} - {shippingInfo?.pinCode}
                    </p>

                    <div className="th-subbox-phone">
                      <Phone size={12} />
                      <span>{shippingInfo?.phoneNo}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="th-subbox">
                    <span className="th-subbox-label">DELIVERY ADDRESS</span>

                    <div className="th-recipient-name">
                      <strong>Standard Delivery</strong>
                    </div>

                    <p className="th-subbox-text">
                      Your order will be shipped to the address provided above.
                    </p>

                    <div className="th-address-status">
                      <CheckCircle2 size={13} />
                      <span>Address confirmed</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cart Items */}
              <section className="th-review-card">
                <div className="th-card-header">
                  <div className="th-card-title-group">
                    <div className="th-icon-bubble">
                      <ShoppingBag size={18} />
                    </div>

                    <h2 className="th-card-heading">Cart Items</h2>
                  </div>

                  <span className="th-lot-badge">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div className="th-items-review-list">
                  {cartItems.map((item) => (
                    <article
                      key={item.product?._id}
                      className="th-item-review-row"
                    >
                      <div className="th-item-thumb-box">
                        <img
                          src={item.product?.images?.[0]?.url || ""}
                          alt={item.product?.title || "Product"}
                          className="th-item-thumb"
                        />
                      </div>

                      <div className="th-item-review-content">
                        <div className="th-item-title-price-row">
                          <h3 className="th-item-review-title">
                            {" "}
                            {item.product?.title}
                          </h3>

                          <div className="th-item-pricing-box">
                            <span className="th-item-final-price">
                              ₹{Number(item.product?.price || 0).toFixed(2)}
                            </span>

                            <span className="th-item-quantity">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className="th-item-product-info">
                          <span>
                            Unit price: ₹
                            {Number(item.product?.price).toFixed(2)}
                          </span>

                          <span className="th-tape-dot">•</span>

                          <span>
                            Quantity: <strong>{item.quantity}</strong>
                          </span>
                        </div>

                        <div className="th-item-total-row">
                          <span>Item Total</span>

                          <strong>
                            ₹
                            {(
                              Number(item.product?.price || 0) * item.quantity
                            ).toFixed(2)}
                            v
                          </strong>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="th-review-note">
                  <CheckCircle2 size={18} />

                  <div>
                    <strong>Your cart is ready for checkout</strong>

                    <p>
                      Review the items and quantities above before continuing to
                      payment.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="th-confirm-right-col">
              <div className="th-ledger-card">
                <div className="th-ledger-head">
                  <h2 className="th-ledger-title">Order Summary</h2>

                  <ShoppingBag size={18} />
                </div>

                <div className="th-ledger-lines">
                  <div className="th-ledger-row">
                    <span className="th-ledger-label">Subtotal</span>

                    <span className="th-ledger-val">
                      ₹{subTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="th-ledger-row">
                    <span className="th-ledger-label">Shipping Charges</span>

                    <span className="th-ledger-val">
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="th-ledger-row">
                    <span className="th-ledger-label">GST (18%)</span>

                    <span className="th-ledger-val">₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="th-ledger-total-strip">
                  <div>
                    <span className="th-total-heading">Total Amount</span>

                    <span className="th-total-subnote">
                      Including GST & shipping
                    </span>
                  </div>

                  <div className="th-total-figure-box">
                    <span className="th-big-total">₹{total.toFixed(2)}</span>

                    <span className="th-currency-code">INR</span>
                  </div>
                </div>

                {/* Continue */}
                <button
                  type="button"
                  className="th-btn-proceed"
                  onClick={proceedToPayment}
                >
                  <span>Proceed to Payment</span>
                  <span className="th-btn-arrow">→</span>
                </button>

                <p className="th-proceed-subcaption">
                  You will be redirected to the payment page to complete your
                  order.
                </p>

                {/* Trust */}
                <div className="th-security-seals">
                  <div className="th-seal-item">
                    <CheckCircle2 size={15} />
                    <span>Order Review</span>
                  </div>

                  <div className="th-seal-item">
                    <CheckCircle2 size={15} />
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>

              {/* Shipping Summary */}
              <div className="th-address-card">
                <div className="th-address-card-header">
                  <MapPin size={15} />
                  <span>DELIVERY TO</span>
                </div>

                <strong>{user?.username}</strong>

                <p>
                  {shippingInfo?.address}, {shippingInfo?.city},{" "}
                  {shippingInfo?.state} {shippingInfo?.pinCode}
                </p>

                <button type="button" onClick={() => navigate("/shipping")}>
                  Change address
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderConfirm;
