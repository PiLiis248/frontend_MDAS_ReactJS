import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import PATHS from "../../../constants/path";
import authService from "../../../services/authService"; 
import Button from "../../common/Button";
import Toast from "../../common/Toast";

// Schema validation
const resetPasswordSchema = yup.object().shape({
  newPassword: yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(800, "Password is too long"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm your new password"),
});

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });
  
  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(token, data.newPassword);

      if (response.status === 200) {
        showNotification("Password reset successfully!", "success");
        setTimeout(() => navigate(PATHS.login), 2000);
      } else {
        showNotification("Failed to reset password. Please try again.", "error");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Invalid or expired token!";
      showNotification(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="authContainer">
      {/* Notification Toast */}
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="authBox">
        <h2 className="title">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <InputField
            label="New Password"
            type="password"
            register={register("newPassword")}
            error={errors.newPassword?.message}
            placeholder="Enter new password"
          />
          <InputField
            label="Confirm New Password"
            type="password"
            register={register("confirmPassword")}
            error={errors.confirmPassword?.message}
            placeholder="Confirm new password"
          />
          <center>
            <Button 
              type="submit" 
              className="submitResetButton"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-indicator">
                  <span className="loading-spinner"></span> Processing...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </center>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;