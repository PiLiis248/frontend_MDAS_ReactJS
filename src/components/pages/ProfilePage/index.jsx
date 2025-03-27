import React, { useState, useEffect, useRef } from "react";
import "../../../assets/Profile.css";
import Sidebar from "../../common/Sidebar";
import ProfileService from "../../../services/profileService";
import Button from "../../common/Button";
import InputField from "../../common/InputField"; // Import InputField component
import * as Yup from 'yup';
import authService from "../../../services/authService"; // Import authService for password reset

const ProfilePage = () => {
  const [user, setUser] = useState({
    avatarUrl: null,
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");  // Global error
  const [success, setSuccess] = useState("");

  // Error states for password fields
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ProfileService.getProfile();
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await ProfileService.uploadAvatar(file, user.email); 
        setUser((prev) => ({ ...prev, avatarUrl: response.data })); 
        setSuccess("Avatar updated successfully!");
      } catch (error) {
        setError("Failed to update avatar.");
      }
    }
  };
  

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChangePassword = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setOldPasswordError("");  
    setNewPasswordError("");
    setConfirmNewPasswordError("");
    setError("");
    setSuccess("");
  };

  const validatePassword = async () => {
    const schema = Yup.object().shape({
      oldPassword: Yup.string().required('Old password is required.'),
      newPassword: Yup.string().required('New password is required.'),
      confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], "Passwords do not match!")
        .required('Confirm new password is required.')
    });

    try {
      await schema.validate({ oldPassword, newPassword, confirmNewPassword }, { abortEarly: false });
      return true;  
    } catch (err) {
      const errorMessages = err.inner.reduce((acc, currentErr) => {
        acc[currentErr.path] = currentErr.message;
        return acc;
      }, {});

      setOldPasswordError(errorMessages.oldPassword || "");
      setNewPasswordError(errorMessages.newPassword || "");
      setConfirmNewPasswordError(errorMessages.confirmNewPassword || "");

      return false;  
    }
  };

  const handleSubmitPasswordChange = async () => {
    const isValid = await validatePassword();
    if (!isValid) return;  

    try {
      const email = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).email
        : sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user")).email
        : "";
  
      const payload = { email, oldPassword, newPassword };
  
      await ProfileService.changePassword(payload);
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data || "Failed to change password.");
        setTimeout(() => {
          setError("");
        }, 1500);
      } else {
        setError("Failed to change password.");
        setTimeout(() => {
          setError("");
        }, 1500);
      }
    }
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      const email = user.email;  // Auto fill email from user profile
      await authService.requestResetPassword(email);
      setSuccess("Reset password link has been sent to email. Please check email or spam!");
      setError("");
    } catch (err) {
      setError("Failed to send reset password link. Please try again.");
      setSuccess("");
    }
  };

  return (
    <div className="profile-container">
      <Sidebar />
      <div className="profile-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="info-column">
              <h2>User Profile</h2>
              <div className="info">
                <p><strong>Username:</strong> {user.userName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Last Name:</strong> {user.lastName}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.status}</p>
              </div>
            </div>

            <div className="avatar-column">
              <label htmlFor="avatarInput" className="avatar-section">
                <img src={`/Avatars/${user.avatarUrl}`} alt="Profile Avatar" className="avatar" />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </label>
              <div className="button-group">
                <Button className="change-avatar-btn" onClick={triggerFileInput}>
                  Change Avatar
                </Button>
                <Button className="change-password-btn" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal for changing password */}
      <div className={`modal ${isModalOpen ? "open" : ""}`} onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Change Password</h2>
          <div className="modal-form">
            <div className="input-container">
              <label htmlFor="oldPassword">Current Password</label>
              <InputField
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                error={oldPasswordError}
              />
            </div>
            <div className="input-container">
              <label htmlFor="newPassword">New Password</label>
              <InputField
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={newPasswordError}
              />
            </div>
            <div className="input-container">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <InputField
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                error={confirmNewPasswordError}
              />
            </div>
            {/* Forgot Password Button */}
            <Button className="forgot-password-btn" onClick={handleForgotPasswordSubmit}>
              Forgot Current Password
            </Button>
            {success && <p className="success" style={{ color: "green" }}>{success}</p>}
            {error && <p className="error" style={{ color: "red" }}>{error}</p>}
          </div>
          <div className="modal-footer">
            <Button className="submit-btn" onClick={handleSubmitPasswordChange}>
              Submit
            </Button>
            <button className="close-btn" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
