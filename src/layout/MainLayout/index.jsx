import { Outlet } from "react-router-dom";
import { AuthProvider } from "../../constants/AuthContext";

const MainLayout = () => {
  return (
    <AuthProvider>
      <div className="page__wrapper">
        <Outlet />
      </div>
    </AuthProvider>
  );
};

export default MainLayout;