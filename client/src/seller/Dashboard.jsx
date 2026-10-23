import React from "react";
import PageTitle from "../components/PageTitle";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import {
  LayoutDashboard,
  ShelvingUnit,
  ShoppingCart,
  Star,
  Plus,
  ArrowUpRight,
  Package,
  Clock3,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  return (
    <>
      <PageTitle title="Seller Dashboard | ThriftHub" />

      <Header />

      <main className="seller-dashboard">
        <div className="seller-dashboard-container">
          {/* ================= SIDEBAR ================= */}

          <aside className="seller-sidebar">
            <div className="seller-sidebar-brand">
              <div className="seller-sidebar-logo">
                <LayoutDashboard size={18} />
              </div>

              <div>
                <span className="seller-sidebar-eyebrow">THRIFTHUB</span>

                <h2>Seller Studio</h2>
              </div>
            </div>

            <nav className="seller-nav">
              <div className="seller-nav-section">
                <span className="seller-nav-heading">Overview</span>

                <Link to="/seller/dashboard" className="seller-nav-link active">
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>
              </div>

              <div className="seller-nav-section">
                <span className="seller-nav-heading">Products</span>

                <Link to="/seller/products" className="seller-nav-link">
                  <ShelvingUnit size={17} />
                  All Products
                </Link>

                <Link to="/seller/product/create" className="seller-nav-link">
                  <Plus size={17} />
                  Create Product
                </Link>
              </div>

              <div className="seller-nav-section">
                <span className="seller-nav-heading">Orders</span>

                <Link to="/seller/orders" className="seller-nav-link">
                  <ShoppingCart size={17} />
                  All Orders
                </Link>
              </div>

              <div className="seller-nav-section">
                <span className="seller-nav-heading">Reviews</span>

                <Link to="/seller/reviews" className="seller-nav-link">
                  <Star size={17} />
                  Product Reviews
                </Link>
              </div>
            </nav>

            <div className="seller-sidebar-footer">
              <span>SELLER ACCOUNT</span>
              <strong>ThriftHub Marketplace</strong>
            </div>
          </aside>

          {/* ================= MAIN CONTENT ================= */}

          <section className="seller-main">
            {/* Header */}

            <div className="seller-main-header">
              <div>
                <div className="seller-eyebrow">
                  <span></span>
                  SELLER STUDIO
                </div>

                <h1>Dashboard</h1>

                <p>
                  Manage your products, orders, and marketplace activity from
                  one place.
                </p>
              </div>

              <Link to="/seller/product/create" className="seller-create-btn">
                <Plus size={17} />
                Add Product
              </Link>
            </div>

            {/* ================= STATS ================= */}

            <div className="seller-stats-grid">
              <div className="seller-stat-card">
                <div className="seller-stat-icon">
                  <IndianRupee size={19} />
                </div>

                <div>
                  <span className="seller-stat-label">Total Revenue</span>

                  <strong>₹0</strong>

                  <small>Lifetime sales</small>
                </div>
              </div>

              <div className="seller-stat-card">
                <div className="seller-stat-icon">
                  <ShelvingUnit size={19} />
                </div>

                <div>
                  <span className="seller-stat-label">Total Products</span>

                  <strong>0</strong>

                  <small>Listed products</small>
                </div>
              </div>

              <div className="seller-stat-card">
                <div className="seller-stat-icon">
                  <ShoppingCart size={19} />
                </div>

                <div>
                  <span className="seller-stat-label">Total Orders</span>

                  <strong>0</strong>

                  <small>Orders containing your products</small>
                </div>
              </div>

              <div className="seller-stat-card">
                <div className="seller-stat-icon">
                  <Clock3 size={19} />
                </div>

                <div>
                  <span className="seller-stat-label">Pending Orders</span>

                  <strong>0</strong>

                  <small>Need your attention</small>
                </div>
              </div>
            </div>

            {/* ================= OVERVIEW ================= */}

            <div className="seller-content-grid">
              {/* Sales Overview */}

              <section className="seller-panel seller-sales-panel">
                <div className="seller-panel-header">
                  <div>
                    <span className="seller-panel-eyebrow">PERFORMANCE</span>

                    <h2>Sales Overview</h2>
                  </div>

                  <TrendingUp size={19} />
                </div>

                <div className="seller-sales-placeholder">
                  <div className="seller-placeholder-icon">
                    <TrendingUp size={24} />
                  </div>

                  <h3>No sales data yet</h3>

                  <p>
                    Your sales activity will appear here once customers purchase
                    your products.
                  </p>
                </div>
              </section>

              {/* Quick Actions */}

              <section className="seller-panel">
                <div className="seller-panel-header">
                  <div>
                    <span className="seller-panel-eyebrow">QUICK ACTIONS</span>

                    <h2>Manage Store</h2>
                  </div>
                </div>

                <div className="seller-quick-actions">
                  <Link
                    to="/seller/product/create"
                    className="seller-action-card"
                  >
                    <Plus size={19} />

                    <div>
                      <strong>Create Product</strong>
                      <span>Add a new item</span>
                    </div>

                    <ArrowUpRight size={16} />
                  </Link>

                  <Link to="/seller/products" className="seller-action-card">
                    <Package size={19} />

                    <div>
                      <strong>Manage Products</strong>
                      <span>Edit your listings</span>
                    </div>

                    <ArrowUpRight size={16} />
                  </Link>

                  <Link to="/seller/orders" className="seller-action-card">
                    <ShoppingCart size={19} />

                    <div>
                      <strong>View Orders</strong>
                      <span>Manage customer orders</span>
                    </div>

                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </section>
            </div>

            {/* ================= RECENT ORDERS ================= */}

            <section className="seller-panel seller-recent-panel">
              <div className="seller-panel-header">
                <div>
                  <span className="seller-panel-eyebrow">RECENT ACTIVITY</span>

                  <h2>Recent Orders</h2>
                </div>

                <Link to="/seller/orders">
                  View All
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="seller-empty-table">
                <ShoppingCart size={23} />

                <h3>No orders yet</h3>

                <p>Orders containing your products will appear here.</p>
              </div>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
