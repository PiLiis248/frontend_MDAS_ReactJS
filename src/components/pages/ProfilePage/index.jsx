import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios"; 
import "../../../assets/Profile.module.css";
import Sidebar from "../../common/Sidebar"

const ProfilePage = () => {
  const [user, setUser] = useState({
    avatarUrl: "https://i.pinimg.com/736x/d7/c6/42/d7c642b611c9ea391ba87f7be7d4ec9b.jpg",
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    status: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    lastName: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")); // Parse user object
    const token = userData?.token; // Lấy token từ user object
  
    if (!token) {
      console.error("Token not found!");
      return;
    }
  
    axiosInstance
      .get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào headers
        },
      })
      .then((response) => {
        const userData = response.data;
        setUser({
          avatarUrl: userData.avatarUrl,
          userName: userData.userName,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          status: userData.status,
        });
  
        setNewUserData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUrl: userData.avatarUrl,
        });
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);
  

  const handleInputChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewUserData({ ...newUserData, avatarUrl: imageUrl });
    }
  };

  const handleSave = () => {
    const userData = JSON.parse(localStorage.getItem("user")); // Parse user object
    const token = userData?.token; // Lấy token từ user object
  
    if (!token) {
      console.error("Token not found!");
      return;
    }
  
    axiosInstance
      .put("/users/profile", newUserData, {
        headers: {
          Authorization: `Bearer ${token}`, // Thêm token vào headers
        },
      })
      .then((response) => {
        const updatedUser = response.data;
        setUser({
          avatarUrl: updatedUser.avatarUrl,
          userName: updatedUser.userName,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          status: updatedUser.status,
        });
  
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  };
  

  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-content">
        <h2>Profile</h2>
        <div className="profile-card">
          <label htmlFor="avatarUpload">
            <img src={user.avatarUrl} alt="Avatar" className="avatar" />
            Change avatar
          </label>
          <input type="file" id="avatarUpload" accept="image/*" onChange={handleAvatarChange} hidden />

          {isEditing ? (
            <>
              <InputField
                label="First Name"
                type="text"
                value={newUserData.firstName}
                onChange={handleInputChange}
                name="firstName"
                placeholder="Enter first name"
              />
              <InputField
                label="Last Name"
                type="text"
                value={newUserData.lastName}
                onChange={handleInputChange}
                name="lastName"
                placeholder="Enter last name"
              />
              <button className="save-btn" onClick={handleSave}>Save</button>
            </>
          ) : (
            <>
              <p><strong>Username:</strong> {user.userName}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>First Name:</strong> {user.firstName}</p>
              <p><strong>Last Name:</strong> {user.lastName}</p>
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
