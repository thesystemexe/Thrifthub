import React, { useEffect } from "react";
import "./Cart.css";
import { ArrowRight, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import PageTitle from "../components/PageTitle";
import CartItem from "./CartItem";

import { userGetCart } from "../features/cart/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems, isLoading, error } = useSelector((store) => store.cart);

  const navigate = useNavigate();

  const subTotal = cartItems.reduce(
    (acc, item) => acc + Number(item.product?.price || 0) * item.quantity,
    0,
  );

  useEffect(() => {
    dispatch(userGetCart());
  }, [dispatch]);

  const tax = Math.ceil(subTotal * 0.18);

  const shipping = subTotal > 500 ? 0 : 50;

  const total = subTotal + tax + shipping;

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  return (
    <>
      <Header />

      <PageTitle title="Your Cart" />

      <main className="th-cart-wrapper">
        <div className="th-cart-container th-cart-main-content">
          {cartItems.length === 0 ? (
            <div className="th-empty-cart">
              <div className="th-empty-cart-content">
                <h1>Your Cart Is Empty</h1>

                <p>You haven't added any pieces to your cart yet.</p>

                <Link to="/products" className="th-btn-browse">
                  Explore Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="th-cart-layout">
              {/* LEFT SIDE */}
              <div className="th-items-column">
                <div className="th-items-header">
                  <div>
                    <h1 className="th-cart-heading">
                      Your Shopping Bag{" "}
                      <span className="th-count-badge">
                        ({cartItems.length}{" "}
                        {cartItems.length === 1 ? "item" : "items"})
                      </span>
                    </h1>
                  </div>

                  <Link to="/products" className="th-continue-link">
                    <ArrowLeft size={14} />
                    <span>Continue Browsing</span>
                  </Link>
                </div>

                <div className="th-items-list">
                  {cartItems.map((item) => (
                    <CartItem
                      item={item}
                      key={item.product || item._id || item.title}
                    />
                  ))}
                </div>

                {/* SHIPPING INFO */}
                <div className="th-impact-bar">
                  <div className="th-impact-left">
                    <div className="th-impact-icon">
                      <Truck size={18} />
                    </div>

                    <div>
                      <strong>
                        {shipping === 0
                          ? "Free shipping unlocked"
                          : "Shipping available"}
                      </strong>

                      <p>
                        {shipping === 0
                          ? "Your order qualifies for free shipping."
                          : "Free shipping on orders above ₹500."}
                      </p>
                    </div>
                  </div>

                  <span className="th-impact-tag">
                    {shipping === 0 ? "FREE SHIPPING" : "₹50 SHIPPING"}
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <aside className="th-summary-card">
                <h2 className="th-summary-title">Order Summary</h2>

                <div className="th-summary-lines">
                  <div className="th-line-item">
                    <span className="th-line-label">Subtotal</span>

                    <span className="th-line-val">₹{subTotal.toFixed(2)}</span>
                  </div>

                  <div className="th-line-item">
                    <span className="th-line-label">Tax (18%)</span>

                    <span className="th-line-val">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="th-line-item">
                    <span className="th-line-label">Shipping</span>

                    <span className="th-line-val">
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="th-total-box">
                  <div>
                    <span className="th-total-caption">TOTAL</span>
                  </div>

                  <div className="th-total-amount">₹{total.toFixed(2)}</div>
                </div>

                <button
                  type="button"
                  className="th-btn-proceed"
                  onClick={checkoutHandler}
                >
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </button>

                <p className="th-guarantee-caption">
                  Review your order before continuing
                </p>

                {/* TRUST INFO */}
                <div className="th-trust-badges">
                  <div className="th-trust-point">
                    <ShieldCheck size={16} />
                    <span>Your cart is securely saved.</span>
                  </div>

                  <div className="th-trust-point">
                    <Truck size={16} />
                    <span>Shipping charges are calculated above.</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Cart;
