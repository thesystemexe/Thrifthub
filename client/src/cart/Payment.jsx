import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CheckoutPath from "./CheckoutPath";
import { useNavigate } from "react-router-dom";
import "./payment.css";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const Payment = () => {
  const { user } = useSelector((store) => store.auth);
  const { shippingInfo } = useSelector((store) => store.cart);

  const navigate = useNavigate();

  const [pricing, setPricing] = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState(null);

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const initialized = useRef(false);

  // ==========================================================
  // GET PAYMENT DETAILS WHEN PAGE LOADS
  // ==========================================================

  useEffect(() => {
    const preparePayment = async () => {
      if (initialized.current) return;

      initialized.current = true;

      try {
        setLoading(true);

        // ====================================================
        // 1. Get Razorpay public key
        // ====================================================

        const keyResponse = await axios.get(
          "http://localhost:4007/api/getKey",
          {
            withCredentials: true,
          },
        );

        if (!keyResponse.data.success && !keyResponse.data.key) {
          throw new Error("Razorpay key not received");
        }

        setRazorpayKey(keyResponse.data.key);

        // ====================================================
        // 2. Create Razorpay order
        // ====================================================
        //
        // IMPORTANT:
        // No amount is sent from frontend.
        //
        // Backend gets the user's MongoDB cart and calculates:
        //
        // subtotal
        // + GST
        // + shipping
        // = total
        //
        // ====================================================

        const orderResponse = await axios.post(
          "http://localhost:4007/api/payment/process",
          {},
          {
            withCredentials: true,
          },
        );

        const orderData = orderResponse.data;

        if (!orderData.success) {
          throw new Error(
            orderData.message || "Unable to create payment order",
          );
        }

        // ====================================================
        // 3. Save backend pricing
        // ====================================================

        setPricing(orderData.pricing);

        // ====================================================
        // 4. Save Razorpay order
        // ====================================================

        setRazorpayOrder(orderData.order);

        console.log("Payment pricing:", orderData.pricing);
        console.log("Razorpay order:", orderData.order);

        setLoading(false);
      } catch (error) {
        console.error("Payment preparation error:", error);

        initialized.current = false;

        setLoading(false);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Unable to prepare payment",
        );
      }
    };

    preparePayment();
  }, []);

  // ==========================================================
  // OPEN RAZORPAY
  // ==========================================================

  const completePayment = async () => {
    if (!razorpayKey) {
      toast.error("Razorpay is not ready yet.");
      return;
    }

    if (!razorpayOrder) {
      toast.error("Payment order is not ready yet.");
      return;
    }

    if (!pricing) {
      toast.error("Order pricing is not ready yet.");
      return;
    }

    if (!shippingInfo) {
      toast.error("Shipping information is missing.");
      return;
    }

    try {
      setPaymentLoading(true);

      // ======================================================
      // RAZORPAY OPTIONS
      // ======================================================

      const options = {
        key: razorpayKey,

        // Amount comes from backend Razorpay order
        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "ThriftHub",

        description: "E-commerce website payment transaction",

        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            // =================================================
            // VERIFY PAYMENT ON BACKEND
            // =================================================

            const verificationResponse = await axios.post(
              "http://localhost:4007/api/paymentVerification",
              {
                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_order_id: response.razorpay_order_id,

                razorpay_signature: response.razorpay_signature,

                shippingInfo: {
                  address: shippingInfo.address,
                  city: shippingInfo.city,
                  country: shippingInfo.country,
                  state: shippingInfo.state,
                  phoneNo: shippingInfo.phoneNo,
                  pinCode: shippingInfo.pinCode,
                },
              },
              {
                withCredentials: true,
              },
            );

            const data = verificationResponse.data;

            // =================================================
            // SUCCESS
            // =================================================

            if (data.success) {
              toast.success("Payment verified successfully!");

              navigate(`/paymentSuccess?reference=${data.reference}`);
            } else {
              toast.error(data.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        prefill: {
          name: user?.username || "",
          email: user?.email || "",
          contact: shippingInfo?.phoneNo || "",
        },

        theme: {
          color: "#1E3A2F",
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);

            toast.info("Payment cancelled");
          },
        },
      };

      // ======================================================
      // OPEN RAZORPAY
      // ======================================================

      const rzp = new window.Razorpay(options);

      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);

      setPaymentLoading(false);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to open Razorpay",
      );
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <PageTitle title="Payment" />

        <Header />

        <CheckoutPath activePath={3} />

        <main className="payment-container">
          <div className="payment-box">
            <div className="payment-header">
              <span className="payment-eyebrow">SECURE CHECKOUT</span>

              <h1>Preparing Your Payment</h1>

              <p>We're securely calculating your order total.</p>
            </div>

            <div className="payment-loading">
              <div className="payment-spinner" />

              <span>Calculating your order total...</span>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // ==========================================================
  // PAYMENT PAGE
  // ==========================================================

  return (
    <>
      <PageTitle title="Payment" />

      <Header />

      <CheckoutPath activePath={3} />

      <main className="payment-container">
        <div className="payment-box">
          {/* HEADER */}

          <div className="payment-header">
            <span className="payment-eyebrow">SECURE CHECKOUT</span>

            <h1>Complete Your Payment</h1>

            <p>Review your order total and continue securely with Razorpay.</p>
          </div>

          {/* PRICE SUMMARY */}

          {pricing && (
            <div className="payment-summary">
              <div className="payment-summary-row">
                <span>Subtotal</span>

                <span>₹{Number(pricing.itemPrice || 0).toFixed(2)}</span>
              </div>

              <div className="payment-summary-row">
                <span>GST (18%)</span>

                <span>₹{Number(pricing.taxPrice || 0).toFixed(2)}</span>
              </div>

              <div className="payment-summary-row">
                <span>Shipping</span>

                <span>
                  {Number(pricing.shippingPrice || 0) === 0
                    ? "FREE"
                    : `₹${Number(pricing.shippingPrice).toFixed(2)}`}
                </span>
              </div>

              <div className="payment-divider" />

              <div className="payment-total-row">
                <div>
                  <span>Total Amount</span>

                  <small>Inclusive of applicable charges</small>
                </div>

                <strong>₹{Number(pricing.totalPrice || 0).toFixed(2)}</strong>
              </div>
            </div>
          )}

          {/* SECURITY */}

          <div className="payment-security">
            <div className="payment-security-icon">✓</div>

            <div>
              <strong>Secure payment</strong>

              <span>Your payment is securely processed through Razorpay.</span>
            </div>
          </div>

          {/* PAY BUTTON */}

          <button
            type="button"
            onClick={completePayment}
            className="payment-button"
            disabled={
              paymentLoading || !razorpayOrder || !pricing || !razorpayKey
            }
          >
            {paymentLoading
              ? "Opening Razorpay..."
              : `Pay ₹${Number(pricing?.totalPrice || 0).toFixed(2)}`}
          </button>

          <p className="payment-note">
            You will be redirected to Razorpay to complete your payment.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Payment;
