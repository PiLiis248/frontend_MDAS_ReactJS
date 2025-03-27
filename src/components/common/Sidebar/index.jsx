import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PATHS from "../../../constants/path";
import "../../../assets/Sidebar.css";
import authService from "../../../services/authService";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin về URL hiện tại
  const [activeTab, setActiveTab] = useState("");

  // Lấy username từ localStorage (hoặc sessionStorage)
  const username = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).userName
    : JSON.parse(sessionStorage.getItem("user")).userName;

  const handleLogout = async () => {
    try {
      await authService.logout(); 
      navigate(PATHS.login); // Điều hướng tới trang login
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Cập nhật activeTab khi URL thay đổi
  useEffect(() => {
    if (location.pathname === PATHS.manageGroup) {
      setActiveTab("manageGroup");
    } else if (location.pathname === PATHS.profile) {
      setActiveTab("profile");
    } else if (location.pathname === PATHS.login) {
      setActiveTab("logout"); // Hoặc có thể không cần điều này nếu không muốn giữ trạng thái active cho tab Logout
    }
  }, [location]); // Khi location thay đổi, effect sẽ chạy

  return (
    <div className="sidebar">
      {/* Hiển thị Hello <username> */}
      {username && <p className="greeting">Hello, {username}</p>}

      <Link
        to={PATHS.manageGroup}
        className={`tab ${activeTab === "manageGroup" ? "active" : ""}`}
      >
        Manage Group
      </Link>
      <Link
        to={PATHS.profile}
        className={`tab ${activeTab === "profile" ? "active" : ""}`}
      >
        Profile
      </Link>
      <div
        className={`tab logout ${activeTab === "logout" ? "active" : ""}`}
        onClick={handleLogout}
      >
        Logout
      </div>
    </div>
  );
};

export default Sidebar;
