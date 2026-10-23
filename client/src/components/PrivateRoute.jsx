import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";

const PrivateRoute = () => {
  const { user } = useSelector((store) => store.auth);

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
