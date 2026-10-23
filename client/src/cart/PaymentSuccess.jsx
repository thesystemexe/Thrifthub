import React, { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "./paymentSuccess.css";

import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

import { useDispatch } from "react-redux";
import { userGetCart } from "../features/cart/cartSlice";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();

  const reference = searchParams.get("reference");

  const dispatch = useDispatch();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;

    // ======================================================
    // Payment verification already created the order.
    // MongoDB transaction also cleared the cart.
    //
    // We only synchronize Redux here.
    // ======================================================

    sessionStorage.removeItem("orderItem");

    dispatch(userGetCart());

    if (reference) {
      toast.success("Order placed successfully!");
    } else {
      toast.error("Payment reference not found");
    }
  }, [dispatch, reference]);

  return (
    <>
      <PageTitle title="Payment Successful" />

      <Header />

      <main className="payment-success-container">
        <div className="payment-success-box">
          {/* Success Icon */}

          <div className="success-icon">
            <span>✓</span>
          </div>

          {/* Heading */}

          <h1>Payment Successful</h1>

          <p>
            Your payment has been verified and your order has been placed
            successfully.
          </p>

          {/* Payment Reference */}

          {reference && (
            <div className="reference-box">
              <span>Payment ID</span>

              <strong>{reference}</strong>
            </div>
          )}

          {/* Actions */}

          <div className="success-actions">
            <Link to="/orders/user">View My Orders</Link>

            <Link to="/">Continue Shopping</Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentSuccess;
