import React, { useState, useEffect, useRef } from "react";
import ProfileService from "../../../services/profileService";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import "../../../assets/ProfileSidebar.css";
import authService from "../../../services/authService";
import * as Yup from 'yup';
import InputField from "../../common/InputField";
import { 
  UserIcon, 
  AtSignIcon, 
  BriefcaseIcon, 
  MailIcon 
} from 'lucide-react';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const [user, setUser] = useState({
    avatarUrl: "",
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef(null);

  // Password change states
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password error states
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

  // Toast state
  const [toast, setToast] = useState({
    message: '',
    type: '',
    isVisible: false
  });

  // Modify the close handler to add closing animation
  const handleClose = () => {
    setIsClosing(true);
    // Delay the actual closing to allow animation to complete
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500); // Should match the CSS animation duration
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await ProfileService.getProfile();
        let userData = response.data;

        if (userData.avatarUrl === null) {
          userData = { ...userData, avatarUrl: "hearts.jpg" };
        }

        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load user profile");
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await ProfileService.uploadAvatar(file, user.email);
        setUser((prev) => ({ ...prev, avatarUrl: response.data }));
        setToast({
          message: 'Avatar updated successfully!',
          type: 'success',
          isVisible: true
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        setToast({
          message: 'Failed to update avatar.',
          type: 'error',
          isVisible: true
        });
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
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
      oldPassword: Yup.string().required('Current password is required.'),
      newPassword: Yup.string()
        .required('New password is required.')
        .min(6, 'Password must be at least 6 characters'),
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
      const payload = { 
        email: user.email, 
        oldPassword, 
        newPassword 
      };
  
      await ProfileService.changePassword(payload);
      setToast({
        message: 'Password changed successfully!',
        type: 'success',
        isVisible: true
      });
      setTimeout(() => {
        closeChangePasswordModal();
      }, 2000);
    } catch (err) {
      setToast({
        message: err.response?.data || "Failed to change password.",
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleForgotPasswordSubmit = async () => {
    try {
      await authService.requestResetPassword(user.email);
      setToast({
        message: 'Reset password link has been sent to email. Please check email or spam!',
        type: 'success',
        isVisible: true
      });
    } catch (err) {
      setToast({
        message: 'Failed to send reset password link. Please try again.',
        type: 'error',
        isVisible: true
      });
    }
  };

  const renderToast = () => {
    if (!toast.isVisible) return null;

    return (
      <Toast 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    );
  };

  if (loading) return null;

  return (
    <div 
      className={`profile-sidebar 
        ${isOpen ? 'open' : ''} 
        ${isClosing ? 'closing' : ''}`}
    >
      <button className="close-sidebar-btn" onClick={handleClose}>
        &times;
      </button>
      
      <div className="profile-sidebar-content">
        <div className="profile-avatar-section">
          <img 
            src={`/Avatars/${user.avatarUrl}`} 
            alt="Profile Avatar" 
            className="profile-avatar" 
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
          <Button 
            className="change-avatar-btn" 
            onClick={triggerFileInput}
          >
            Change Avatar
          </Button>
        </div>

        <div className="profile-details">
          <h3>{`${user.firstName} ${user.lastName}`}</h3>
          
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <BriefcaseIcon size={20} />
            </div>
            <div className="profile-detail-label">Role</div>
            <div className="profile-detail-value">{user.role}</div>
          </div>
          
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <UserIcon size={20} />
            </div>
            <div className="profile-detail-label">Username</div>
            <div className="profile-detail-value">{user.userName}</div>
          </div>
          
          <div className="profile-detail-item">
            <div className="profile-detail-icon">
              <MailIcon size={20} />
            </div>
            <div className="profile-detail-label">Email</div>
            <div className="profile-detail-value">{user.email}</div>
          </div>
        </div>

        <Button 
          className="change-password-btn"
          onClick={openChangePasswordModal}
        >
          Change Password
        </Button>

        {/* Password Change Modal */}
        {isChangePasswordModalOpen && (
          <div className="password-change-modal">
            <div className="modal-content">
              <h2>Change Password</h2>
              <div className="input-container">
                <label>Current Password</label>
                <InputField
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  error={oldPasswordError}
                />
              </div>
              <div className="input-container">
                <label>New Password</label>
                <InputField
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={newPasswordError}
                />
              </div>
              <div className="input-container">
                <label>Confirm New Password</label>
                <InputField
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  error={confirmNewPasswordError}
                />
              </div>
              
              <Button 
                className="forgot-password-btn"
                onClick={handleForgotPasswordSubmit}
              >
                Forgot Password
              </Button>

              {success && <p className="success-message">{success}</p>}
              {error && <p className="error-message">{error}</p>}

              <div className="modal-buttons">
                <Button 
                  className="submit-btn"
                  onClick={handleSubmitPasswordChange}
                >
                  Submit
                </Button>
                <Button 
                  className="cancel-btn"
                  onClick={closeChangePasswordModal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {renderToast()}
    </div>
  );
};

export default ProfileSidebar;