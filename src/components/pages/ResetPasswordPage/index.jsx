import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import PATHS from "../../../constants/path";
import authService from "../../../services/authService"; // Import authService
import Button from "../../common/Button";

// Schema validation
const resetPasswordSchema = yup.object().shape({
  newPassword: yup.string().required("Enter new password").min(6, "Password must be at least 6 characters"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm your new password"),
});

const ResetPasswordPage = () => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await authService.resetPassword(token, data.newPassword); // Gọi API từ authService

      if (response.status === 200) {
        setSuccessMessage("✅ Password reset successfully!");
        setTimeout(() => navigate(PATHS.login), 2000);
      } else {
        setError("❌ Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "❌ Invalid or expired token!");
    }
  };

  return (
    <div className="authContainer">
      <div className="authBox">
        <h2 className="title">Reset Password</h2>
        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
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
            <Button type="submit" className="submitButton">
              LASSGO
            </Button>
          </center>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
