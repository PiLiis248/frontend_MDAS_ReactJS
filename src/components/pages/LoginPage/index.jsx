import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import PATHS from "../../../constants/path";
import ResendConfirmationForm from "../../common/ResendConfirmationForm";
import Button from "../../common/Button";
import Toast from "../../common/Toast";
import authService from "../../../services/authService";
import withAuth from "../../../hoc/withAuth";

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

const LoginPage = (props) => {
  const { login } = props;
  
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
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
  
  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(""); 
    try {
      await login(data.userName, data.password, rememberMe);
      showToast("Login successful!", "success");
    } catch (err) {
      if (err.message.includes("not activated")) {
        setInactiveEmail(data.userName);
        showToast("Your account is not activated", "error");
      } 
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true); 
      setResetMessage(""); 
      setIsResetSent(false);
      await authService.requestResetPassword(email);
      showToast("Reset password email sent!", "success");
      setResetMessage("✅ The link will expired after 5 mins. Please check your email or spam!");
      setIsResetSent(true);
    } catch (error) {
      showToast(error.message, "error");
      setResetMessage("❌ Check email address again !");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleResendResetPassword = async () => {
    try {
      setIsLoading(true);
      setResetMessage(""); 
      await authService.resendResetPassword(email);
      showToast("New reset password email sent!", "success");
      setResetMessage("✅ The link will expired after 5 mins. Please check your email or spam!");
    } catch (error) {
      showToast(error.message, "error");
      setResetMessage("❌ Check email address again !");
    } finally {
      setIsLoading(false); 
    }
  };

  const closeModal = () => {
    setEmail("");
    setResetMessage(""); 
    setIsResetSent(false); 
    setShowModal(false);
  };

  return (
    <div className="authContainer">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)}
        />
      )}

      <div className="authBox">
        {!inactiveEmail ? (
          <>
            <h2 className="title">LOGIN</h2>
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
              <Button 
                type="submit" 
                className="submitLoginButton"
                disabled={isLoading}
              >
                {isLoading ? (
                    <span className="loading-indicator">
                      <span className="loading-spinner"></span> Processing...
                    </span>
                  ) : (
                    "Login"
                  )}
              </Button>
            </form>
            <p className="footerText">
              Don't have an account? <Link to={PATHS.register} className="link">Register</Link>
            </p>
          </>
        ) : (
          <>
            <center>
              <p className="title">Inactivated Account</p>
              <p className="inactiveConfirm">Your account has not been activated. Please check your email or spam for the activation link.</p>
              <p className="inactiveConfirm">The link will expire after 30 days. If so, please provide your email to send activation link back.</p>
              <ResendConfirmationForm onSuccessMessageChange={setToast}/>
              <Link type="button" className="link" onClick={() => setInactiveEmail(null)}>
                Close
              </Link>
            </center>
          </>
        )}
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
                <Button 
                  className="submitResetButton" 
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                      <span className="loading-indicator">
                        <span className="loading-spinner"></span> Processing...
                      </span>
                    ) : (
                      "Send reset link"
                    )
                  }
                </Button>
                <Link type="button" className="link" onClick={() => setShowModal(false)}>
                  Close
                </Link>
              </>
            ) : (
              <>
                <Button 
                  className="submitResendButton" 
                  onClick={handleResendResetPassword}
                  disabled={isLoading}  
                >
                  {isLoading ? (
                      <span className="loading-indicator">
                        <span className="loading-spinner"></span> Processing...
                      </span>
                    ) : (
                      "Resend"
                    )
                  }
                </Button>
                <Link type="button" className="link" onClick={() => setShowModal(false)}>
                  Close
                </Link>
              </>
            )}
            {resetMessage && <p className="resetMessage">{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

// Export the wrapped component with requireAuth set to false
// This is because login page should be accessible to unauthenticated users
export default withAuth(LoginPage, false);