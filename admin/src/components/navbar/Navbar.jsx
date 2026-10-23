import React from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { assets } from "../../assets/assets";
import "./navbar.css";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-brand">
        <div className="admin-navbar-mark">TH</div>

        <div className="admin-navbar-brand-text">
          <span className="admin-navbar-title">ThriftHub</span>

          <span className="admin-navbar-subtitle">Administration</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-navbar-status">
          <span className="admin-status-dot"></span>

          <span>System Online</span>
        </div>

        <div className="admin-profile">
          <div className="admin-profile-info">
            <span className="admin-profile-name">
              {user?.username || "Administrator"}
            </span>

            <span className="admin-profile-role">Administrator</span>
          </div>

          <div className="admin-profile-image">
            <img src={assets.brand_logo} alt="Admin" />
          </div>

          <ChevronDown size={15} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
