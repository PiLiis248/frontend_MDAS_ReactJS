// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/pages/LoginPage";
import RegisterPage from "./components/pages/RegisterPage";
import MainLayout from "./layout/MainLayout";
import PATHS from "./constants/path";

function App() {
  console.log("App is rendering...");
  return (
    // BrowserRouter - Routes - Route - Route (each page)
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public Routes */}
          {/* <Route element={<PublicRoute />}> */}
          <Route path={PATHS.login} element={<LoginPage />} />
          <Route path={PATHS.register} element={<RegisterPage />} />
          {/* <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} /> */}
        {/* </Route> */}

          {/* <Route path={PATHS.login} element={<LoginPage />} /> */}

          {/* Private Routes */}
          {/* <Route element={<PrivateRoute />}> */}
          {/* <Route path={routes.manageGroup} element={<ManageGroupPage />} /> */}
          {/* <Route path={routes.profile} element={<ProfilePage />} /> */}
          {/* </Route> */}

          {/* Trang thông báo (Ai cũng vào được) */}
          {/* <Route path={routes.state} element={<StatePage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
