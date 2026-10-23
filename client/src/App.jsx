import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import PrivateRoute from "./components/PrivateRoute";
import { useDispatch, useSelector } from "react-redux";
import { userGetMe } from "./features/auth/authSlice";
import SellerApplicationForm from "./components/sellerApplicationform/SellerApplicationForm";
import { sellerProfile } from "./features/seller/sellerSlice";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Cart from "./cart/Cart";
import Shipping from "./cart/Shipping";
import OrderConfirm from "./cart/OrderConfirm";
import Payment from "./cart/Payment";
import PaymentSuccess from "./cart/PaymentSuccess";
import MyOrders from "./orders/MyOrders";
import OrderDetails from "./orders/OrderDetails";
import Favorites from "./pages/Favorites";
import Dashboard from "./seller/Dashboard";
import SellerRoute from "./components/SellerRoute";
import CreateProduct from "./seller/products/CreateProduct";
import SellerProducts from "./seller/products/SellerProducts";
import EditProduct from "./seller/products/EditProduct";
import SellerOrders from "./seller/orders/SellerOrders";
import SellerOrderDetails from "./seller/orders/SellerOrderDetails";
import VisualSearch from "./pages/VisualSearch";
import { userGetFavorites } from "./features/products/productSlice";
import { userGetCart } from "./features/cart/cartSlice";
import { createNotificationSocket } from "./features/notifications/notificationSocket";
import {
  addNotification,
  clearNotifications,
  fetchNotifications,
} from "./features/notifications/notificationSlice";

const App = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isInitialized } = useSelector((store) => store.auth);

  useEffect(() => {
    dispatch(userGetMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(userGetFavorites());
      dispatch(sellerProfile());
      dispatch(userGetCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user?.id) {
      dispatch(clearNotifications());
      return;
    }

    const socket = createNotificationSocket();

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));

      if (
        notification.type === "seller_approved" ||
        notification.type === "seller_rejected"
      ) {
        // Refresh the latest user roles and seller application status.
        dispatch(userGetMe());
        dispatch(sellerProfile());
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.connect();

    // Fetch persisted notifications too, including ones received while offline.
    dispatch(fetchNotifications());

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.disconnect();
    };
  }, [dispatch, user?.id]);

  if (!isInitialized) {
    return (
      <div>
        <h1>fetching user...</h1>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/email-verify"
            element={
              user?.isAccountVerified ? (
                <Navigate to="/" replace />
              ) : (
                <EmailVerify />
              )
            }
          />
          <Route
            path="submitSellerApplication/:userId"
            element={<SellerApplicationForm />}
          />
          <Route path="product/:productId" element={<ProductDetails />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:keyword" element={<Products />} />
          <Route path="visual-search" element={<VisualSearch />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/order/confirm" element={<OrderConfirm />} />
          <Route path="/process/payment" element={<Payment />} />
          <Route path="/paymentSuccess" element={<PaymentSuccess />} />
          <Route path="/orders/user" element={<MyOrders />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/seller" element={<SellerRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="product/create" element={<CreateProduct />} />
            <Route path="products" element={<SellerProducts />} />
            <Route
              path="product/update-product/:productId"
              element={<EditProduct />}
            />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="order/:orderId" element={<SellerOrderDetails />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
