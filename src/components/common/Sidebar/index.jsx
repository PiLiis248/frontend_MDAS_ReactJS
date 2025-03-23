import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PATHS from "../../../constants/path";
import "../../../assets/Sidebar.css";
import { logout } from "../../../api/axios"; // Import logout từ axiosInstance

const Sidebar = () => {
  const navigate = useNavigate();

  // Lấy username từ localStorage (hoặc sessionStorage)
  const username = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).userName : JSON.parse(sessionStorage.getItem("user")).userName;

  const handleLogout = async () => {
    try {
      await logout(); // Gọi phương thức logout từ axios
      navigate(PATHS.login); // Điều hướng tới trang login
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="sidebar">
      {/* Hiển thị Hello <username> */}
      {username && <p className="greeting">Hello, {username}</p>}
      
      <Link to={PATHS.manageGroup} className="tab">Manage Group</Link>
      <Link to={PATHS.profile} className="tab">Profile</Link>
      <div className="tab logout" onClick={handleLogout}>
        Logout
      </div>
    </div>
  );
};

export default Sidebar;
