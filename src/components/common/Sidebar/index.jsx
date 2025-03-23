import React from "react";
import { useNavigate } from "react-router-dom";
import PATHS from "../../../constants/path";

const Sidebar = () => {

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate(PATHS.login);
  };
  

  return (
    <div className="sidebar">
      <button className="tab">Manage Group</button>
      <button className="tab logout" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Sidebar;
