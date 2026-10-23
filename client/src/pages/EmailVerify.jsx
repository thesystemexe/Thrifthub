import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import {
  reset,
  userSendVerifyOtp,
  userVerifyEmail,
} from "../features/auth/authSlice";
import "../styles/emailVerify.css";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const OTP_LENGTH = 6;

const EmailVerify = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (store) => store.auth,
  );

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset slice messages on unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Handle single digit input
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Keep only the last character typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace and key navigation
  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle Pasting full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];

    digits.forEach((digit, index) => {
      newOtp[index] = digit;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = digit;
      }
    });

    setOtp(newOtp);
    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  // Submit OTP Verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length < OTP_LENGTH) {
      alert("Please enter a complete 6-digit verification code.");
      return;
    }

    // Replace `verifyOtp` with your actual thunk/API action when ready
    console.log("Submitting OTP:", otpString);

    try {
      const resMessage = await dispatch(userVerifyEmail(otpString)).unwrap();
      toast.success(resMessage || "Email verified successfully");
      navigate("/");
    } catch (error) {
      toast.error(error || "Error occurred during verification of Email");
      console.error("Verification failed:", error);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;
    try {
      const resMessage = await dispatch(userSendVerifyOtp()).unwrap();
      toast.success(resMessage || "OTP resent successfully!");
      setTimer(60);
      setCanResend(false);
      setOtp(new Array(OTP_LENGTH).fill(""));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err || "Failed to resend OTP");
    }
  };

  return (
    <div className="verify-container">
      <header className="reset-top-header">
        <Link to="#" className="brand-logo-link">
          <img
            src={assets.brand_logo}
            alt="ThriftHub Logo"
            className="brand-logo"
          />
          <span className="brand-name">ThriftHub</span>
        </Link>
      </header>

      <div className="verify-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="verify-icon-wrapper">
          <Mail size={32} className="verify-icon" />
        </div>

        <h2 className="verify-title">Verify your email</h2>
        <p className="verify-subtitle">
          We've sent a 6-digit confirmation code to{" "}
          <strong className="user-email-highlight">
            {user?.email || "your email address"}
          </strong>
        </p>

        {/* Status Alerts */}
        {isError && (
          <div className="alert error">{message || "Verification failed."}</div>
        )}
        {isSuccess && (
          <div className="alert success">
            {message || "OTP sent successfully!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="otp-inputs-container" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`otp-field ${digit ? "filled" : ""}`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || otp.join("").length < OTP_LENGTH}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <CheckCircle size={18} /> Verify Code
              </>
            )}
          </button>
        </form>

        <div className="resend-wrapper">
          <span>Didn't receive the code? </span>
          {canResend ? (
            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={isLoading}
            >
              <RefreshCw size={14} /> Resend OTP
            </button>
          ) : (
            <span className="timer-text">
              Resend in <strong>{timer}s</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
