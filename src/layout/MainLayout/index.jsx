import { Outlet } from "react-router-dom";
import AuthContextProvider from "../../constants/AuthContext";
const MainLayout = () => {
  return (
    <AuthContextProvider>
      <div className="page__wrapper">
        <Outlet />
      </div>
    </AuthContextProvider>
  );
};

export default MainLayout;
