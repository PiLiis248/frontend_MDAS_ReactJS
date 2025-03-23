import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import PATHS from "../../../constants/path";
import ResendConfirmationButton from "../../common/ResendConfirmationButton";
import Button from "../../common/Button";
import { authService } from "../../../services/authService"; // Import authService

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

  // Xử lý đăng nhập
  const onSubmit = async (data) => {
    try {
      const response = await authService.login({
        username: data.username,
        password: data.password,
      });

      const userData = response.data;

      if (userData.status !== "ACTIVE") {
        setInactiveEmail(userData.email);
        setError("Your account is not activated. Please check your email.");
        return;
      }

      if (!userData.token) {
        setError("Authentication failed. Please try again.");
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", userData.token); // Lưu token vào storage
      storage.setItem("user", JSON.stringify(userData)); // Lưu thông tin user

      console.log("token after login: " + storage.getItem("token"));
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
      await authService.requestResetPassword(email);
      setResetMessage("✅ We have sent an email. Please check your email or spam!");
      setIsResetSent(true);
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  // Xử lý resend yêu cầu reset password
  const handleResendResetPassword = async () => {
    try {
      setResetMessage(""); 
      await authService.resendResetPassword(email);
      setResetMessage("✅ A new reset password email has been sent!");
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
    <div className="authContainer">
      <div className="authBox">
        <h2 className="title">LOGIN</h2>
        {error && <p className="error">{error}</p>}
        <center>
          {inactiveEmail && (
            <div className="buttonGroup">
              <ResendConfirmationButton email={inactiveEmail} />
              <Button 
                className="modalClose"
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
        <form onSubmit={handleSubmit(onSubmit)} className="form">
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
          <div className="rememberMeContainer">
            <label>
              <InputField 
                type="checkbox" 
                label="Remember me"
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)} 
              />
            </label>
            <Link type="button" className="link" onClick={() => setShowModal(true)}>
              Forgot Password?
            </Link>
          </div>
          <center>
          <Button type="submit" className="submitButton">
            LASSGO
          </Button>
          </center>
        </form>
        <p className="footerText">
          Don't have an account? <Link to={PATHS.register} className="link">Register</Link>
        </p>
      </div>

      {/* Modal Forgot Password */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Reset Password</h3>
            <p>Enter your email to receive a password reset link:</p>
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            {!isResetSent ? (
              <>
                <Button className="modalButton" onClick={handleResetPassword}>
                  Send Reset Link
                </Button>
                <Button className="modalClose" onClick={closeModal}>
                  Close
                </Button>
              </>
            ) : (
              <>
                <Button className="modalButton" onClick={handleResendResetPassword}>
                  Resend
                </Button>
                <Button className="modalClose" onClick={closeModal}>
                  Login
                </Button>
              </>
            )}
            {resetMessage && <p className="resetMessage">{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
