import React, { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { assets } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin, reset } from "../features/auth/authSlice";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isError, isSuccess, user, isLoading } = useSelector(
    (store) => store.auth,
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (isError) {
      dispatch(reset());
    }

    if (isSuccess || user) {
      navigate("/");
      dispatch(reset());
    }
  }, [dispatch, navigate, user, isError, isSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(adminLogin(formData));
  };

  return (
    <main className="admin-login-page">
      {/* ================================
          Header
      ================================= */}

      <header className="admin-login-header">
        <Link to="/" className="admin-brand">
          <img
            src={assets.brand_logo}
            alt="ThriftHub"
            className="admin-brand-logo"
          />

          <span className="admin-brand-name">ThriftHub</span>
        </Link>

        <div className="admin-header-label">
          <span>ADMIN</span>
          <span className="admin-header-divider"></span>
          <span>PRIVATE ACCESS</span>
        </div>
      </header>

      {/* ================================
          Main
      ================================= */}

      <section className="admin-login-main">
        <div className="admin-login-layout">
          {/* ================================
              Editorial Intro
          ================================= */}

          <div className="admin-login-intro">
            <div className="admin-eyebrow">
              <span className="admin-eyebrow-line"></span>
              ThriftHub Administration
            </div>

            <h1>
              Manage the
              <br />
              <em>marketplace.</em>
            </h1>

            <p>
              Your private workspace for managing the ThriftHub marketplace,
              sellers, products, orders, and platform activity.
            </p>

            <div className="admin-intro-meta">
              <span>THRIFTHUB</span>
              <span>•</span>
              <span>ADMIN CONSOLE</span>
            </div>
          </div>

          {/* ================================
              Login Card
          ================================= */}

          <div className="admin-login-card">
            <div className="admin-card-header">
              <div className="admin-security-badge">
                <ShieldCheck size={14} strokeWidth={2} />
                <span>SECURE ADMIN ACCESS</span>
              </div>

              <h2>Welcome back.</h2>

              <p>Sign in with your administrator credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-login-form">
              {/* Email */}

              <div className="admin-form-group">
                <label htmlFor="admin-email">Email address</label>

                <div className="admin-input-wrapper">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className="admin-input-icon"
                  />

                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    placeholder="admin@thrifthub.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}

              <div className="admin-form-group">
                <div className="admin-label-row">
                  <label htmlFor="admin-password">Password</label>

                  <Link to="/forgot-password" className="admin-forgot-link">
                    Forgot password?
                  </Link>
                </div>

                <div className="admin-input-wrapper">
                  <Lock
                    size={18}
                    strokeWidth={1.8}
                    className="admin-input-icon"
                  />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="admin-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                className="admin-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="admin-button-loader">
                    <span></span>
                  </div>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}

            <div className="admin-card-footer">
              <span className="admin-footer-dot"></span>

              <span>Authorized administrators only · Secure connection</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
          Footer
      ================================= */}

      <footer className="admin-login-footer">
        <span>© {new Date().getFullYear()} ThriftHub</span>

        <span>Administration Console</span>
      </footer>
    </main>
  );
};

export default Login;
