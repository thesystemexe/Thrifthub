import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import sellerReducer from "../features/seller/sellerSlice";
import productReducer from "../features/products/productSlice";
import cartReducer from "../features/cart/cartSlice";
import orderReducer from "../features/order/orderSlice";
import notificationReducer from "../features/notifications/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
    notifications: notificationReducer,
  },
  devTools: true,
});

export default store;
