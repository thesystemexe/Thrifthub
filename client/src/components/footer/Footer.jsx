import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ShieldCheck, Tag } from "lucide-react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="th-footer">
      <div className="th-footer-container">
        {/* Brand & Editorial Mission */}
        <div className="th-footer-brand">
          <Link to="/" className="th-footer-logo">
            ThriftHub<span className="th-logo-dot">.</span>
          </Link>
          <p className="th-footer-tagline">
            The curated marketplace for timeless vintage & archival fashion.
            Authenticated pieces paired with precise flat-laid measurements.
          </p>
        </div>

        {/* Navigation Group */}
        <div className="th-footer-links-group">
          <div className="th-footer-column">
            <h4 className="th-column-title">Shop Archive</h4>
            <ul>
              <li>
                <Link to="/shop?category=Outerwear">Outerwear & Jackets</Link>
              </li>
              <li>
                <Link to="/shop?category=Denim">Denim & Jeans</Link>
              </li>
              <li>
                <Link to="/shop?category=Tops">T-Shirts & Tops</Link>
              </li>
              <li>
                <Link to="/shop?era=90s">90s Archival</Link>
              </li>
              <li>
                <Link to="/shop?era=Y2K">Y2K Essentials</Link>
              </li>
            </ul>
          </div>

          <div className="th-footer-column">
            <h4 className="th-column-title">Merchant Portal</h4>
            <ul>
              <li>
                <Link to="/seller/register">Become a Merchant</Link>
              </li>
              <li>
                <Link to="/seller/dashboard">Seller Dashboard</Link>
              </li>
              <li>
                <Link to="/guidelines">Listing Standards</Link>
              </li>
              <li>
                <Link to="/seller/verification">Verification Process</Link>
              </li>
            </ul>
          </div>

          <div className="th-footer-column">
            <h4 className="th-column-title">Support & Fit</h4>
            <ul>
              <li>
                <Link to="/help/fit-guide">AI Fit Sizing Guide</Link>
              </li>
              <li>
                <Link to="/help/authenticity">Condition Standards</Link>
              </li>
              <li>
                <Link to="/help/escrow">Escrow & Guarantee</Link>
              </li>
              <li>
                <Link to="/help/shipping">Shipping & Returns</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Telemetry Strip */}
      <div className="th-footer-meta-strip">
        <div className="th-meta-container">
          <div className="th-meta-item">
            <Tag size={13} className="th-meta-icon" />
            <span className="th-mono-text">ARCHIVE BATCH #2026.09</span>
          </div>
          <div className="th-meta-item">
            <span className="th-mono-text">
              SYSTEM STATUS: 99.4% AI FIT MATCH
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="th-footer-bottom">
        <div className="th-bottom-container">
          <p className="th-copyright">
            &copy; {new Date().getFullYear()} ThriftHub Inc. All rights
            reserved.
          </p>

          <div className="th-footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram <ExternalLink size={10} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter <ExternalLink size={10} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">
              TikTok <ExternalLink size={10} />
            </a>
          </div>

          <div className="th-footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="th-divider">•</span>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
