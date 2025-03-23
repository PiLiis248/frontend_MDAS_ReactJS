import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const isAuthenticated = user?.token;

  return isAuthenticated ? <Navigate to="/profile" replace /> : <Outlet />;
};

export default PublicRoute;
