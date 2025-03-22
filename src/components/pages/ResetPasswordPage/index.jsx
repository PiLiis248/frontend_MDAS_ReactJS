import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import styles from "../../../assets/Auth.module.css";
import PATHS from "../../../constants/path";
import axiosInstance from "../../../api/axios";

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
  console.log(token);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.get(
        `/users/resetPassword?token=${token}&newPassword=${data.newPassword}`
      );
      

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
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2 className={styles.title}>Reset Password</h2>
        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
            <button type="submit" className={styles.submitButton}>Reset Password</button>
          </center>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
