import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PATHS from "../../../constants/path";
import authService from "../../../services/authService";
import profileService from "../../../services/profileService";
import tokenMethod from "../../../api/token";
import "../../../assets/Navbar.css";

const Navbar = ({ onOpenProfile }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await profileService.getProfile();
        let userData = response.data;

        // If no avatar, use default
        if (userData.avatarUrl === null) {
          userData = { ...userData, avatarUrl: "Default/hearts.jpg" };
        }

        setUsername(`${userData.firstName} ${userData.lastName}`);
        setAvatarUrl(userData.avatarUrl);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load user profile");
        // Redirect to login if profile fetch fails
        tokenMethod.remove();
        navigate(PATHS.login);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      
      // Clear token and navigate to login
      tokenMethod.remove();
      navigate(PATHS.login);
    } catch (error) {
      console.error("Logout failed", error);
      
      // Ensure navigation even if logout fails
      tokenMethod.remove();
      navigate(PATHS.login);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="user-profile">
          <img 
            src={`/Avatars/${avatarUrl}`} 
            alt="User Avatar" 
            className="user-avatar" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/Avatars/Default/hearts.jpg';
            }}
          />
          <div className="user-info">
            <span className="username">{username}</span>
            <button 
              className="view-profile-btn" 
              onClick={onOpenProfile}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
      <div className="navbar-right">
        <button 
          className="logout-btn" 
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;