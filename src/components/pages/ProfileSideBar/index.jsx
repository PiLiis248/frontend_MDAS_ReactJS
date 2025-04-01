import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from 'yup';
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import "../../../assets/ProfileSidebar.css";
import InputField from "../../common/InputField";
import { 
  UserIcon, 
  BriefcaseIcon, 
  MailIcon 
} from 'lucide-react';

import { 
  fetchUserProfile,
  uploadAvatar,
  changePassword,
  requestResetPassword,
  togglePasswordModal,
  updatePasswordField,
  setPasswordErrors,
  clearToast
} from "../../../redux/profile/profileSlice";

const ProfileSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { 
    user, 
    isProfileLoading,
    isAvatarUploading,
    isChangePasswordModalOpen,
    isResetPasswordLoading,
    isForgotPasswordLoading,
    passwordForm,
    toast
  } = useSelector((state) => state.profile);

  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUserProfile());
    } else {
      dispatch(togglePasswordModal(false));
    }
  }, [isOpen, dispatch]);

  // Modify the close handler to add closing animation
  const handleClose = () => {
    setIsClosing(true);
    
    // Close the password modal first if it's open
    if (isChangePasswordModalOpen) {
      dispatch(togglePasswordModal(false));
    }
    
    // Delay the actual closing to allow animation to complete
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 500); // Should match the CSS animation duration
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(uploadAvatar({ file, email: user.email }));
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const openChangePasswordModal = () => {
    dispatch(togglePasswordModal(true));
  };

  const closeChangePasswordModal = () => {
    dispatch(togglePasswordModal(false));
  };

  const handlePasswordInputChange = (field) => (e) => {
    dispatch(updatePasswordField({ field, value: e.target.value }));
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
      await schema.validate({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword
      }, { abortEarly: false });
      return true;
    } catch (err) {
      const errorMessages = err.inner.reduce((acc, currentErr) => {
        acc[currentErr.path] = currentErr.message;
        return acc;
      }, {});

      dispatch(setPasswordErrors({
        oldPasswordError: errorMessages.oldPassword || "",
        newPasswordError: errorMessages.newPassword || "",
        confirmNewPasswordError: errorMessages.confirmNewPassword || ""
      }));

      return false;
    }
  };

  const handleSubmitPasswordChange = async () => {
    const isValid = await validatePassword();
    if (!isValid) return;

    dispatch(changePassword({
      email: user.email,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }));
  };

  const handleForgotPasswordSubmit = () => {
    dispatch(requestResetPassword(user.email));
  };

  if (isProfileLoading) return null;

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
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/Avatars/Default/hearts.jpg';
            }}
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
            disabled={isAvatarUploading}
          >
            {isAvatarUploading ? "Uploading..." : "Change Avatar"}
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
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordInputChange('oldPassword')}
                  error={passwordForm.oldPasswordError}
                />
              </div>
              <div className="input-container">
                <label>New Password</label>
                <InputField
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange('newPassword')}
                  error={passwordForm.newPasswordError}
                />
              </div>
              <div className="input-container">
                <label>Confirm New Password</label>
                <InputField
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordInputChange('confirmNewPassword')}
                  error={passwordForm.confirmNewPasswordError}
                />
              </div>
              
              <Button 
                className="forgot-password-btn"
                onClick={handleForgotPasswordSubmit}
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? (
                  <span className="loading-indicator">
                    <span className="loading-spinner"></span> Processing...
                  </span>
                ) : (
                  "Forgot Password"
                )}
              </Button>

              <div className="modal-buttons">
                <Button 
                  className="submit-btn"
                  onClick={handleSubmitPasswordChange}
                  disabled={isResetPasswordLoading}
                >
                  {isResetPasswordLoading ? (
                    <span className="loading-indicator">
                      <span className="loading-spinner"></span> Processing...
                    </span>
                  ) : (
                    "Reset"
                  )}
                </Button>
                {!isResetPasswordLoading && (
                  <Button 
                    className="cancel-btn"
                    onClick={closeChangePasswordModal}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {toast.isVisible && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(clearToast())}
        />
      )}
    </div>
  );
};

export default ProfileSidebar;