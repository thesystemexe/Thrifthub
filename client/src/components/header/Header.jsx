import {
  Search,
  Camera,
  Heart,
  ShoppingBag,
  MessageSquare,
  Bell,
  ChevronDown,
  RefreshCw,
  Leaf,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  Clock,
  TicketCheck,
  Store,
} from "lucide-react";
import "./header.css";
import { assets } from "../../assets/assets";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  reset,
  userLogout,
  userSendVerifyOtp,
} from "../../features/auth/authSlice";
import {
  readNotification,
  readAllNotifications,
} from "../../features/notifications/notificationSlice";
import { userGetMe } from "../../features/auth/authSlice";
import { sellerProfile } from "../../features/seller/sellerSlice";
import { toast } from "react-toastify";
const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((store) => store.auth);
  const { cartItems } = useSelector((store) => store.cart);
  const { profile } = useSelector((store) => store.seller);
  const { favorites } = useSelector((store) => store.product);
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
  } = useSelector((store) => store.notifications);

  /* * -------------------------------------------------- * Seller status * -------------------------------------------------- */
  const sellerStatus = profile?.status?.toLowerCase();
  const isSeller =
    user?.roles?.includes("seller") || sellerStatus === "approved";
  const isPendingSeller = sellerStatus === "pending";
  const isRejectedSeller = sellerStatus === "rejected";
  /* * -------------------------------------------------- * Active category * -------------------------------------------------- */
  const searchParams = new URLSearchParams(location.search);
  const activeCategory = searchParams.get("category");
  const activeEra = searchParams.get("era");
  const isCategoryActive = (category) =>
    location.pathname === "/shop" &&
    activeCategory?.toLowerCase() === category.toLowerCase();
  const isAIActive = location.pathname === "/recommendations";
  const imageSearchInputRef = useRef(null);

  /* * -------------------------------------------------- * Verify email * -------------------------------------------------- */ const handleVerifyEmail =
    async () => {
      try {
        const resMessage = await dispatch(userSendVerifyOtp()).unwrap();
        setShowMenu(false);
        navigate("/email-verify");
        toast.success(resMessage || "OTP sent to your email");
      } catch (error) {
        console.log("Failed to send email", error);
        toast.error(error || "Failed to send verification email");
      }
    };
  /* * -------------------------------------------------- * Search * -------------------------------------------------- */ const handleSearchButton =
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/products");
      }
      setSearchQuery("");
    };
  /* * -------------------------------------------------- * Logout * -------------------------------------------------- */ const handleLogoutButton =
    async () => {
      try {
        await dispatch(userLogout());
        dispatch(reset());
        navigate("/login");
      } catch (error) {
        console.log(error);
      }
    };
  /* * -------------------------------------------------- * Close profile dropdown * -------------------------------------------------- */ useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.readAt) {
      dispatch(readNotification(notification._id));
    }
    setShowNotifications(false);

    if (notification.type === "seller_approved") {
      await Promise.all([
        dispatch(userGetMe()).unwrap(),
        dispatch(sellerProfile()).unwrap(),
      ]);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(readAllNotifications());
    }
  };

  return (
    <header className="store-header">
      {/* ========================================= Announcement Bar ========================================= */}
      <div className="announcement-bar">
        <Leaf size={12} strokeWidth={2} />
        <span className="leaf-emoji">🌱</span>
        <span> Save up to 70% off retail & reduce fashion waste </span>
        <span className="announcement-dot">•</span>
        <span> Free shipping on orders over ₹5000 </span>
      </div>
      {/* ========================================= Main Header ========================================= */}
      <div className="main-header">
        {/* Logo */}
        <div className="logo">
          <img src={assets.brand_logo} alt="brand_logo" className="logo-img" />
          <Link to="/" className="logo-link">
            <span>ThriftHub</span>
          </Link>
        </div>
        {/* Search */}
        <form className="search-container" onSubmit={handleSearchButton}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vintage items, archival brands, sizes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            className="camera-btn"
            aria-label="Search products by image"
            title="Search by image"
            onClick={() => imageSearchInputRef.current?.click()}
          >
            <Camera size={22} />
          </button>

          <input
            ref={imageSearchInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                navigate("/visual-search", {
                  state: { imageFile: file },
                });
              }
              // Allow selecting the same image again.
              event.target.value = "";
            }}
          />
        </form>
        {/* Actions */}
        <div className="header-actions">
          {/* Wishlist */}
          <Link to="/favorites">
            <button className="header-action">
              <Heart size={24} strokeWidth={1.8} />
              <span className="badge badge-red"> {favorites?.length} </span>
            </button>
          </Link>
          {/* Shopping Bag */}
          <Link to="/cart">
            <button className="header-action">
              <ShoppingBag size={24} strokeWidth={1.8} />
              <span className="badge badge-dark">{cartItems.length}</span>
            </button>
          </Link>
          {/* Messages */}
          <button className="header-action">
            <MessageSquare size={24} strokeWidth={1.8} />
            <span className="badge badge-orange"> 1 </span>
          </button>
          {/* Notifications */}

          {/* Notifications */}
          <div className="notification-wrapper">
            <button
              type="button"
              className="header-action notification"
              aria-label={`Notifications, ${unreadCount} unread`}
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((previous) => !previous)}
            >
              <Bell size={24} strokeWidth={1.8} />

              {unreadCount > 0 && (
                <span className="badge badge-orange">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-heading">
                  <strong>Notifications</strong>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notification-mark-all"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notificationsLoading && notifications.length === 0 ? (
                  <p className="notification-empty">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="notification-empty">
                    You're all caught up. No notifications yet.
                  </p>
                ) : (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        className={`notification-item ${
                          notification.readAt ? "" : "unread"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <span className="notification-item-title">
                          {notification.title}
                        </span>

                        <span className="notification-item-message">
                          {notification.message}
                        </span>

                        <span className="notification-item-date">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-wrapper" ref={profileRef}>
            <div
              className="profile"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <div className="avatar-badge">
                {user?.username ? user.username[0].toUpperCase() : "U"}
              </div>
              <div className="profile-info">
                <span className="username"> {user?.username} </span>
                <span className="user-role">
                  {isSeller ? "user & seller" : "user"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`chevron ${showMenu ? "rotate" : ""}`}
              />
            </div>
            {showMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-user-header">
                  <span className="user-email-label"> Signed in as </span>
                  <span className="user-email"> {user?.email} </span>
                </div>
                <div className="dropdown-divider" />
                {/* ===================================== Never Applied ===================================== */}
                {!profile && !isSeller && (
                  <Link
                    className="menu-item"
                    to={`/submitSellerApplication/${user?.id}`}
                    onClick={() => setShowMenu(false)}
                  >
                    <Store size={16} /> <span> Apply as Seller </span>
                  </Link>
                )}
                {/* ===================================== Pending ===================================== */}
                {isPendingSeller && !isSeller && (
                  <div className="menu-item disabled">
                    <Clock size={16} /> <span> Application Pending </span>
                  </div>
                )}
                {/* ===================================== Rejected ===================================== */}
                {isRejectedSeller && !isSeller && (
                  <Link
                    className="menu-item warning"
                    to={`/submitSellerApplication/${user?.id}`}
                    onClick={() => setShowMenu(false)}
                  >
                    <RefreshCw size={16} />
                    <span> Reapply as Seller </span>
                  </Link>
                )}
                {/* ===================================== Approved Seller ===================================== */}
                {isSeller && (
                  <Link
                    className="menu-item seller-badge"
                    to="/seller/dashboard"
                    onClick={() => setShowMenu(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span> Seller Dashboard </span>
                  </Link>
                )}
                {/* Verify Email */}
                {!user?.isAccountVerified && (
                  <button className="menu-item" onClick={handleVerifyEmail}>
                    <User size={16} /> <span> Verify Email </span>
                  </button>
                )}
                {/* Settings */}
                <Link
                  className="menu-item"
                  to="/settings"
                  onClick={() => setShowMenu(false)}
                >
                  <Settings size={16} /> <span> Update Profile </span>
                </Link>
                {/* Orders */}
                <Link
                  className="menu-item"
                  to="/orders/user"
                  onClick={() => setShowMenu(false)}
                >
                  <TicketCheck size={16} /> <span> Orders </span>
                </Link>
                <div className="dropdown-divider" /> {/* Logout */}
                <button
                  className="menu-item logout"
                  onClick={handleLogoutButton}
                >
                  <LogOut size={16} /> <span> Logout </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ========================================= Category Navigation ========================================= */}
      <nav className="category-nav">
        <div className="categories">
          <Link
            to="/products?category=Tops"
            className={isCategoryActive("Tops") ? "active" : ""}
          >
            Tops
          </Link>
          <Link
            to="/products?category=Shirts"
            className={isCategoryActive("Shirts") ? "active" : ""}
          >
            Shirts
          </Link>
          <Link
            to="/products?category=Outwear"
            className={isCategoryActive("Outwear") ? "active" : ""}
          >
            Outwear
          </Link>
          <Link
            to="/products?era=Shirt"
            className={isCategoryActive("Shirt") ? "active" : ""}
          >
            Shirt
          </Link>
          <Link to="/recommendations" className={isAIActive ? "active" : ""}>
            AI Recommendations
          </Link>
        </div>
        {/* ===================================== Seller Navigation ===================================== */}
        {isSeller ? (
          <Link to="/seller/dashboard" className="sell-link">
            Seller Dashboard
          </Link>
        ) : isPendingSeller ? (
          <span className="sell-link seller-pending">Application Pending</span>
        ) : isRejectedSeller ? (
          <Link
            to={`/submitSellerApplication/${user?.id}`}
            className="sell-link seller-reapply"
          >
            Reapply as Seller
          </Link>
        ) : (
          <Link
            to={`/submitSellerApplication/${user?.id}`}
            className="sell-link"
          >
            Sell on ThriftHub
          </Link>
        )}
      </nav>
    </header>
  );
};
export default Header;
