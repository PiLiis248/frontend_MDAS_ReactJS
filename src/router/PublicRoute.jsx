// src/router/PublicRoute.js
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isAuthenticated = localStorage.getItem("token");

  return isAuthenticated ? <Navigate to="/profile" replace /> : <Outlet />;
};

export default PublicRoute;
