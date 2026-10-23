import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Protected = ({ children }) => {
  const { user } = useSelector((store) => store.auth);

  if (!user) {
    return <Navigate to={"/login"}></Navigate>;
  }

  if (!user.role.includes("admin")) {
    return <Navigate to={"/login"}></Navigate>;
  }
  return children;
};

export default Protected;
