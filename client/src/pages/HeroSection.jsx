import React from "react";
import {
  Search,
  Camera,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/heroSection.css";

export default function HeroSection() {
  const popularSearches = [
    "90s Levi's 501",
    "Carhartt Detroit Jackets",
    "Stüssy Tribe Archive",
    "Shetland Knitwear",
    "Vintage Leather",
  ];

  const navigate = useNavigate();

  return (
    <section className="th-hero-section">
      {/* Background atmosphere — stays inside hero */}
      <div className="th-hero-bg-glow-right" />
      <div className="th-hero-bg-glow-left" />

      <div className="th-hero-container">
        {/* LEFT */}
        <div className="th-hero-content">
          <div className="th-provenance-pill">
            <span className="th-pulse-dot" />
            <span className="th-provenance-text">
              ARCHIVAL CURATION WEEK 42 • 840+ NEW PIECES VERIFIED TODAY
            </span>
          </div>

          <h1 className="th-hero-title">
            The Curated Marketplace for Timeless Vintage &amp; Archival Pieces.
          </h1>

          <p className="th-hero-subtitle">
            Find authenticated 90s denim, rare streetwear, and circular fashion
            with AI-powered sizing precision, escrow buyer protection, and
            image-based vintage search.
          </p>

          {/* CTA */}
          <div className="th-cta-group">
            <a href="#featured-drops" className="th-btn-primary">
              <span>Explore Archival Drops</span>
              <ArrowRight size={16} />
            </a>

            <button type="button" className="th-btn-secondary">
              Start Selling
            </button>

            <button
              type="button"
              className="th-btn-terracotta"
              onClick={() => navigate("/visual-search")}
            >
              <Sparkles size={16} />
              <span>Try AI Visual Search</span>
            </button>
          </div>

          {/* Trust */}
          <div className="th-trust-row">
            <div className="th-trust-item">
              <Sparkles size={16} className="th-trust-icon" />

              <div>
                <strong className="th-trust-title">AI Sizing Precision</strong>

                <p className="th-trust-sub">Zero Fit Regrets</p>
              </div>
            </div>

            <div className="th-trust-item">
              <ShieldCheck size={16} className="th-trust-icon" />

              <div>
                <strong className="th-trust-title">Escrow Protection</strong>

                <p className="th-trust-sub">Funds Held Till Approval</p>
              </div>
            </div>

            <div className="th-trust-item">
              <CheckCircle2 size={16} className="th-trust-icon" />

              <div>
                <strong className="th-trust-title">Verified Provenance</strong>

                <p className="th-trust-sub">Authenticity Hand-Checked</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Featured Product */}
        <div className="th-hero-showcase">
          <div className="th-showcase-card">
            {/* Product Image */}
            <div className="th-image-wrapper">
              <div className="th-era-badge">1994 LEVI'S ARCHIVE</div>

              <button
                type="button"
                className="th-heart-btn"
                aria-label="Save to Wishlist"
              >
                <Heart size={18} />
              </button>

              <img
                src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop"
                alt="1994 Levi's 70507 Type III Denim Trucker Jacket"
                className="th-product-img"
              />

              {/* AI Match */}
              <div className="th-ai-fit-pill">
                <Sparkles size={13} />

                <div className="th-ai-fit-content">
                  <strong>99.4% AI Match</strong>
                  <span>Based on your measurements</span>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="th-card-header">
              <div className="th-card-info">
                <span className="th-grade-tag">RARE GRADE A</span>

                <h3 className="th-card-title">Original Type III Trucker</h3>

                <p className="th-card-desc">
                  Made in USA • Natural Honeycomb Patina
                </p>
              </div>

              <div className="th-pricing">
                <span className="th-original-price">$380</span>

                <span className="th-current-price">$185</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
