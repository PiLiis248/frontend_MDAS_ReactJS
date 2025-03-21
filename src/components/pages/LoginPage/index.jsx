import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import styles from "../../../assets/Auth.module.css";
import PATHS from "../../../constants/path";

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
  const [resetMessage, setResetMessage] = useState(""); // Thông báo gửi mail
  const [isResetSent, setIsResetSent] = useState(false); // Kiểm tra trạng thái gửi email thành công

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log("Login Data:", data);
      navigate(PATHS.manageGroup);
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý gửi yêu cầu reset password
  const handleResetPassword = async () => {
    try {
      setResetMessage(""); // Reset thông báo cũ
      setIsResetSent(false);
      const response = await fetch(`http://localhost:8080/api/v1/users/resetPasswordRequest?email=${email}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to send reset password email. Please try again later.");
      }

      setResetMessage("✅ We have sent an email. Please check your email or spam!");
      setIsResetSent(true);
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  // Xử lý resend yêu cầu reset password
  const handleResendResetPassword = async () => {
    try {
      setResetMessage(""); // Reset thông báo cũ

      const response = await fetch(`http://localhost:8080/api/v1/users/resendResetPassword?email=${email}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to resend reset password email. Please try again.");
      }

      setResetMessage("✅ A new reset password email has been sent!");
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2 className={styles.title}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
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
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
              />
              Remember Me
            </label>
            <Link type="button" className={styles.link} onClick={() => setShowModal(true)}>
              Forgot Password?
            </Link>
          </div>
          <center>
            <button type="submit" className={styles.submitButton}>Login</button>
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
            <input
              type="email"
              className={styles.modalInput}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isResetSent ? (
              <>
              <button className={styles.modalButton} onClick={handleResetPassword}>
                Send Reset Link
              </button>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
              Close
            </button>
            </>
            ) : (
              <>
                <button className={styles.modalButton} onClick={handleResendResetPassword}>
                  Resend
                </button>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                  Login
                </button>
              </>
            )}
            {/* <button className={styles.modalClose} onClick={() => setShowModal(false)}>
              Close
            </button> */}
            {resetMessage && <p className={styles.resetMessage}>{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;