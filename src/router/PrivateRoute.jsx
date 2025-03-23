import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const PrivateRoute = () => {
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const isAuthenticated = user?.token;

  // return isAuthenticated ?  <Outlet /> : <Navigate to="/login" replace />;
  if (!isAuthenticated) return <Navigate to="/login"/>;
  return (
    <>
      <div>
        <Sidebar/>
      </div>

      <div>
        <Outlet/>
      </div>
    </>
  )
};

export default PrivateRoute;
