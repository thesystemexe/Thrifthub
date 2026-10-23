import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import "../styles/register.css";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset, userRegister } from "../features/auth/authSlice";
import { assets } from "../assets/assets";

const Register = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [showPassword, setShowPassword] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(true);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const { isSuccess, isError, isLoading, message } = useSelector(
    (store) => store.auth,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess) {
      navigate("/");
    }
  }, [isError, isSuccess, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...formData, aiAssistant });
    const userData = formData;
    dispatch(userRegister(userData));
  };

  const handleToggleButton = (value) => {
    if (value == "login") {
      setActiveTab("login");
      navigate("/login");
    }

    if (value == "create") {
      setActiveTab("create");
      navigate("/register");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          zIndex: 9999,
        }}
      >
        <Loader2 className="animate-spin" size={48} />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="auth-container">
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
      <div className="auth-card">
        {/* Form Panel */}
        <div className="form-panel">
          <div className="top-bar">
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
                onClick={() => handleToggleButton("create")}
              >
                Create Account
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => handleToggleButton("login")}
              >
                Log In
              </button>
            </div>
            <div className="bonus-tag">
              <span>🎁 +$10 BONUS</span>
            </div>
          </div>

          <div className="form-header">
            <h2>Create your ThriftHub Account</h2>
            <p>
              Join the community of verified fashion collectors and circular
              style hunters.
            </p>
          </div>

          {/* Social Login (Google Only) */}
          <button type="button" className="google-btn">
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Your"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter a valid email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#forgot" className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="password-hint">
                <span>Security: Standard</span>
                <span>Requires uppercase & numeral</span>
              </div>
            </div>

            {/* AI Assistant Checkbox */}
            <div className="ai-checkbox-card">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={aiAssistant}
                  onChange={(e) => setAiAssistant(e.target.checked)}
                />
                <span className="ai-checkmark"></span>
                <div className="checkbox-text">
                  <div className="checkbox-title">
                    <span>Enable AI Size Assistant</span>
                    <span className="instant-badge">INSTANT MATCH</span>
                  </div>
                  <p>
                    Store waist & shoulder sizing to unlock personalized 'Fit
                    Badges' on vintage cuts.
                  </p>
                </div>
              </label>
            </div>

            <button type="submit" className="submit-btn">
              <span>Create Account & Get $10 Thrift Credit</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="form-footer">
            <p className="terms-text">
              By continuing, you agree to ThriftHub terms. We support secure
              MERN stack auth & 256-bit encrypted data pipelines.
            </p>
            <p className="login-link">
              Already have an account? <Link to="/login">Login In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
