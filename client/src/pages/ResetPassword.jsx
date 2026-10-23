import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import "../styles/resetPassword.css";

import {
  resetPasswordState,
  userResetPassword,
  userSendResetOtp,
  userVerifyResetOtp,
} from "../features/auth/authSlice";

const OTP_LENGTH = 6;

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

  // Step 1 State
  const [email, setEmail] = useState("");

  // Step 2 State
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Step 3 State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { resetPassword } = useSelector((store) => store.auth || {});
  const { isLoading, isError, message } = resetPassword;

  // Resend Timer logic for Step 2
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- STEP 1: Send OTP to Email ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }
    try {
      // Connect to your Redux thunk here:
      // await dispatch(sendResetOtp(email)).unwrap();
      const response = await dispatch(userSendResetOtp(email)).unwrap();
      toast.success(response.message || "OTP sent to your email!");
      dispatch(resetPasswordState());
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      const errorMsg = typeof error === "object" ? error?.message : error;
      toast.error(errorMsg || "Failed to send OTP.");
    }
  };

  // --- STEP 2 OTP Handlers ---
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < OTP_LENGTH) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }
    try {
      // Connect to your Redux thunk here if backend requires verifying OTP separately:
      // await dispatch(verifyResetOtp({ email, otp: otpString })).unwrap();
      const response = await dispatch(
        userVerifyResetOtp({ email, otp: otpString }),
      ).unwrap();
      toast.success(response.message || "OTP verified!");
      setStep(3);
      dispatch(resetPasswordState());
    } catch (error) {
      const errorMsg = typeof error === "object" ? error?.message : error;
      toast.error(errorMsg || "Invalid OTP code.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      const response = await dispatch(userSendResetOtp(email)).unwrap();
      toast.success(response.message || "New OTP sent to your email!");
      dispatch(resetPasswordState());
      setTimer(60);
      setCanResend(false);
      setOtp(new Array(OTP_LENGTH).fill(""));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (error) {
      const errorMsg = typeof error === "object" ? error?.message : error;
      toast.error(errorMsg || "Failed to resend OTP.");
    }
  };

  // --- STEP 3: Reset Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const otpString = otp.join("");
      // Connect to your Redux thunk here:
      // await dispatch(resetPassword({ email, otp: otpString, newPassword })).unwrap();
      const response = await dispatch(
        userResetPassword({ email, otp: otpString, newPassword }),
      ).unwrap();
      toast.success(
        response.message || "Password reset successfully! Please login.",
      );
      navigate("/login");
      dispatch(resetPasswordState());
    } catch (error) {
      const errorMsg = typeof error === "object" ? error?.message : error;
      toast.error(errorMsg || "Failed to reset password.");
    }
  };

  return (
    <div className="reset-page-container">
      {/* Top Left Branding Header */}
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

      {/* Main Form Card Container */}
      <div className="reset-card-wrapper">
        <div className="reset-card">
          {/* Step Back Button */}
          <button
            className="back-step-btn"
            onClick={() =>
              step > 1 ? setStep((prev) => prev - 1) : navigate("/login")
            }
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Progress Indicator */}
          <div className="step-indicator">
            <span className={`step-dot ${step >= 1 ? "active" : ""}`}>1</span>
            <span className="step-line"></span>
            <span className={`step-dot ${step >= 2 ? "active" : ""}`}>2</span>
            <span className="step-line"></span>
            <span className={`step-dot ${step >= 3 ? "active" : ""}`}>3</span>
          </div>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div className="step-content">
              <div className="icon-badge">
                <Mail size={28} />
              </div>
              <h2 className="reset-title">Reset your password</h2>
              <p className="reset-subtitle">
                Enter your registered email address and we'll send you a 6-digit
                OTP code.
              </p>

              <form onSubmit={handleSendOtp} className="reset-form">
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-field-wrapper">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <div className="step-content">
              <div className="icon-badge">
                <KeyRound size={28} />
              </div>
              <h2 className="reset-title">Enter OTP Code</h2>
              <p className="reset-subtitle">
                We sent a 6-digit verification code to{" "}
                <strong className="email-highlight">{email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="reset-form">
                <div className="otp-container" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className={`otp-box ${digit ? "filled" : ""}`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={isLoading || otp.join("").length < OTP_LENGTH}
                >
                  {isLoading ? <span className="spinner"></span> : "Verify OTP"}
                </button>
              </form>

              <div className="resend-container">
                <span>Didn't receive code? </span>
                {canResend ? (
                  <button
                    className="resend-action-btn"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    <RefreshCw size={14} /> Resend OTP
                  </button>
                ) : (
                  <span className="resend-timer">
                    Resend in <strong>{timer}s</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <div className="step-content">
              <div className="icon-badge">
                <Lock size={28} />
              </div>
              <h2 className="reset-title">Set New Password</h2>
              <p className="reset-subtitle">
                Your identity has been verified. Enter your new password below.
              </p>

              <form onSubmit={handleResetPassword} className="reset-form">
                <div className="input-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="input-field-wrapper">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
