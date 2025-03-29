import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";  // Import Provider từ react-redux
import store from "./redux/store";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import ManageGroupPage from "./components/pages/ManageGroupPage";
import MainLayout from "./layout/MainLayout";
import PATHS from "./constants/path";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";
import PublicRoute from "./router/PublicRoute";
import PrivateRoute from "./router/PrivateRoute";

function App() {
  console.log("App is rendering...");
  return (
    <Provider store={store}>  {/* ✅ Bọc Redux Provider */}
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path={PATHS.login} element={<LoginPage />} />
              <Route path={PATHS.register} element={<RegisterPage />} />
              <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
            </Route>

            {/* Private Routes */}
            <Route element={<PrivateRoute />}>
              <Route path={PATHS.manageGroup} element={<ManageGroupPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
