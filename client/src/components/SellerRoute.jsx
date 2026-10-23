import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const SellerRoute = () => {
  const { user } = useSelector((store) => store.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role.includes("seller")) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default SellerRoute;
