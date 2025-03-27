import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import { useAuth } from "../../../constants/AuthContext";
import PATHS from "../../../constants/path";
import ResendConfirmationButton from "../../common/ResendConfirmationButton";
import Button from "../../common/Button";
import authService from "../../../services/authService"; 

const loginSchema = yup.object().shape({
  userName: yup.string()
      .required("Username is required")
      .min(6, "Username must be at least 6 characters")
      .max(50, "Username must be at most 50 characters"),
  password: yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(800, "Password is too long"),
});

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [resetMessage, setResetMessage] = useState(""); 
  const [isResetSent, setIsResetSent] = useState(false); 
  const [inactiveEmail, setInactiveEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000); 
  
      return () => clearTimeout(timer); // Xóa timer nếu component unmount
    }
  }, [error]);
  

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(""); // Clear any previous errors
    try {
      await login(data.userName, data.password, rememberMe);
    } catch (err) {
      // Handle different types of login errors
      if (err.message.includes("not activated")) {
        setInactiveEmail(data.userName);
      }
      setError(err.message || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleResendResetPassword = async () => {
    try {
      setResetMessage(""); 
      await authService.resendResetPassword(email);
      setResetMessage("✅ A new reset password email has been sent!");
    } catch (error) {
      setResetMessage("❌ " + error.message);
    }
  };

  const closeModal = () => {
    setEmail("");
    setShowModal(false);
  };

  return (
    <div className="authContainer">
      <div className="authBox">
        <h2 className="title">LOGIN</h2>
        {error && (
          <div 
            style={{
              width: 'fit-content',
              position: 'fixed', 
              top: '20px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              backgroundColor: 'rgba(255, 0, 0, 0.8)', 
              color: 'white', 
              padding: '15px', 
              borderRadius: '8px',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: 'fadeInOut 2s ease-in-out'
            }}
          >
            {error}
          </div>
        )}
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            10% { opacity: 1; transform: translateX(-50%) translateY(0); }
            90% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          }
        `}</style>
        <center>
          {inactiveEmail && (
            <div className="buttonGroup">
              <ResendConfirmationButton email={inactiveEmail} />
              <Button 
                className="modalClose"
                onClick={() => {
                  setInactiveEmail(null);
                  setError(""); 
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
            register={register("userName")} 
            error={errors.userName?.message} 
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
              <input
                type="checkbox"
                checked={rememberMe} 
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
            <Link type="button" className="link" onClick={() => setShowModal(true)}>
              Forgot Password?
            </Link>
          </div>
          <center>
          <Button 
            type="submit" 
            className="submitButton"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'LASSGO'}
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
          <div className="modalForgotPassword">
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