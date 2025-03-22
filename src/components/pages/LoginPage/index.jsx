import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import styles from "../../../assets/Auth.module.css";
import PATHS from "../../../constants/path";
import axiosInstance from "../../../api/axios";
import ResendConfirmationButton from "../../common/ResendConfirmationButton";
import Button from "../../common/Button";

// Schema kiểm tra login
const loginSchema = yup.object().shape({
  username: yup.string()
    .required("Username is required")
    .max(50, "Username must be at most 50 characters"),
  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [resetMessage, setResetMessage] = useState(""); 
  const [isResetSent, setIsResetSent] = useState(false); 
  const [inactiveEmail, setInactiveEmail] = useState(null);

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(`/login?username=${data.username}&password=${data.password}`);

      const userData = response.data;

      if (userData.status !== "ACTIVE") {
        setInactiveEmail(userData.email); 
        setError("Your account is not activated. Please check your email for activation. The token will expire after 10 days.");
        return;
      }
      
      if (!userData.token) {
        setError("Authentication failed. Please try again.");
        return;
      }

       // 🔥 Lưu token vào localStorage
      localStorage.setItem("token", userData.token);

      console.log("Login successful:", userData);
      navigate(PATHS.manageGroup);
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Invalid username or password. Please try again.");
    }
  };

  // Xử lý gửi yêu cầu reset password
  const handleResetPassword = async () => {
    try {
      setResetMessage(""); 
      setIsResetSent(false);
      const response = await axiosInstance.get(`/users/resetPasswordRequest?email=${email}`);

      if (response.status === 200) {
        setResetMessage("✅ We have sent an email. Please check your email or spam!");
        setIsResetSent(true);
      } else {
        throw new Error("Failed to send reset password email. Please try again later.");
      }
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  // Xử lý resend yêu cầu reset password
  const handleResendResetPassword = async () => {
    try {
      setResetMessage(""); 

      const response = await axiosInstance.get(`/users/resendResetPassword?email=${email}`);

      if (response.status === 200) {
        setResetMessage("✅ A new reset password email has been sent!");
      } else {
        throw new Error("Failed to resend reset password email. Please try again.");
      }
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  // Close modal and reset email input
  const closeModal = () => {
    setEmail("");
    setShowModal(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <center>
          {inactiveEmail && (
            <div className={styles.buttonGroup}>
              <ResendConfirmationButton email={inactiveEmail} />
              <Button 
                className={styles.modalClose} 
                onClick={() => {
                  setInactiveEmail(null);
                  setError(""); // Ẩn luôn thông báo lỗi
                }}
              >
                Close
              </Button>
            </div>
          )}
        </center>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <InputField 
            label="Username" 
            register={register("username")} 
            error={errors.username?.message} 
            placeholder="Enter your username"
          />
          <InputField 
            label="Password" 
            type="password" 
            register={register("password")} 
            error={errors.password?.message} 
            placeholder="Enter your password"
          />
          <div className={styles.rememberMeContainer}>
            <label>
            <InputField 
              type="checkbox" 
              label="Remember me"
              checked={rememberMe} 
              onChange={() => setRememberMe(!rememberMe)} 
            />
            </label>
            <Link type="button" className={styles.link} onClick={() => setShowModal(true)}>
              Forgot Password?
            </Link>
          </div>
          <center>
          <Button type="submit" className={styles.submitButton}>
            Login
          </Button>
          </center>
        </form>
        <p className={styles.footerText}>
          Don't have an account? <Link to={PATHS.register} className={styles.link}>Register</Link>
        </p>
      </div>

      {/* Modal Forgot Password */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reset Password</h3>
            <p>Enter your email to receive a password reset link:</p>
            <InputField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {!isResetSent ? (
              <>
                <Button className={styles.modalButton} onClick={handleResetPassword}>
                  Send Reset Link
                </Button>
                <Button className={styles.modalClose} onClick={closeModal}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button className={styles.modalButton} onClick={handleResendResetPassword}>
                  Resend
                </Button>
                <Button className={styles.modalClose} onClick={closeModal}>
                  Login
                </Button>
              </>
            )}
            {resetMessage && <p className={styles.resetMessage}>{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
