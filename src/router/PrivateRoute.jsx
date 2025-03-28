import { Navigate, Outlet } from "react-router-dom";
import tokenMethod from "../api/token";

const PrivateRoute = () => {
  const isAuthenticated = tokenMethod.getToken();
  return !isAuthenticated ? <Navigate to="/login" replace /> : <Outlet />;
};

export default PrivateRoute;
