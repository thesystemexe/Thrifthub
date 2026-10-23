import React, { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import "../styles/login.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { reset, userLogin } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, message, user, isSuccess, isError } = useSelector(
    (store) => store.auth,
  );

  const location = useLocation();
  // const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isError) {
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess || user) {
      navigate("/");
      // navigate(redirect)
      dispatch(reset());
    }
  }, [isSuccess, user, dispatch, isError, isLoading, navigate, message]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(userLogin(formData));
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
          </div>

          <div className="form-header">
            <h2>Welcome back to ThriftHub</h2>
            <p>
              Enter your credentials to access your saved items and account
              settings.
            </p>
          </div>

          {/* Social Login */}
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
            <span>OR LOG IN WITH EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter a valid Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/reset-password" className="forgot-link">
                  Forgot password?
                </Link>
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
            </div>

            <button type="submit" className="submit-btn">
              <span>Sign In to Account</span>
              <LogIn size={18} />
            </button>
          </form>

          <div className="form-footer">
            <p className="terms-text">
              By continuing, you agree to ThriftHub terms. We support secure
              MERN stack auth & 256-bit encrypted data pipelines.
            </p>
            <p className="login-link">
              Don't have an account? <Link to="/register">Create One</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
