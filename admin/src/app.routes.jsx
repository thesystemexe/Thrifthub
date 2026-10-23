import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Protected from "./components/Protected";
import PendingSellers from "./components/PendingSellers";
import SellerVerification from "./components/SellerVerification";
import ApprovedSellers from "./pages/ApprovedSellers";
import Products from "./pages/Products";
import ProductDetails from "./components/ProductDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminOrders from "./pages/AdminOrders";
import Reviews from "./pages/Reviews";
import ProductReviews from "./pages/ProductReviews";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <AdminLayout />
      </Protected>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pendingSellers",
        element: <PendingSellers />,
      },
      {
        path: "/seller/:sellerId",
        element: <SellerVerification />,
      },
      {
        path: "/sellers",
        element: <ApprovedSellers />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/product/:productId",
        element: <ProductDetails />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/user/:userId",
        element: <UserDetails />,
      },
      {
        path: "/orders",
        element: <AdminOrders />,
      },
      {
        path: "/order/:orderId",
        element: <AdminOrderDetails />,
      },
      {
        path: "/reviews",
        element: <Reviews />,
      },
      {
        path: "/reviews/product/:productId",
        element: <ProductReviews />,
      },
    ],
  },
]);
