import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import styles from "../../../assets/Auth.module.css";
import PATHS from "../../../constants/path";
import authService from "../../../services/authService"; 
import ResendConfirmationButton from "../../common/ResendConfirmationButton";
import Button from "../../common/Button";

// Schema kiểm tra đăng ký
const registerSchema = yup.object().shape({
  userName: yup.string()
    .required("Username is required")
    .min(6, "Username must be at least 6 characters")
    .max(50, "Username must be at most 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: yup.string()
    .email("Invalid email")
    .min(6, "Email must be at least 6 characters")
    .max(50, "Email must be at most 50 characters")
    .required("Email is required"),
  firstName: yup.string()
    .required("First name is required")
    .matches(/^[A-Za-z]+$/, "First name can only contain letters")
    .max(50, "First name must be at most 50 characters"),
  lastName: yup.string()
    .required("Last name is required")
    .matches(/^[A-Za-z]+$/, "Last name can only contain letters")
    .max(50, "Last name must be at most 50 characters"),
  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(800, "Password is too long"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const RegisterPage = () => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState(""); 
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log("Register Data:", data);
      const { confirmPassword, ...requestData } = data;
      setRegisteredEmail(data.email);

      // Gọi API qua authService
      const response = await authService.register(requestData); 

      if (response.status === 200) {
        setSuccessMessage(response.data.message || "Registration successful! Check your email.");
        setError("");
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) {
      setError("No registered email found.");
      return;
    }

    try {
      const response = await authService.resendConfirmationEmail(registeredEmail);

      if (response.status === 200) {
        setSuccessMessage("Confirmation email resent. Please check your email or spam folder!");
        setError("");
      } else {
        throw new Error(response.data?.message || "Failed to resend email");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.registerAuthBox}>
        <h2 className={styles.title}>REGISTER</h2>

        {successMessage && (
          <>
            <p className={styles.success}>{successMessage}</p>
            <div className={styles.buttonGroup}>
              <ResendConfirmationButton email={registeredEmail} />
              <Button className={styles.loginButton} onClick={() => navigate(PATHS.login)}>
                Login
              </Button>
            </div>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {!successMessage && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.gridContainer}>
              <InputField 
                label="Username" 
                register={register("userName")} 
                error={errors.userName?.message} 
                placeholder="Enter your username"
              />
              <InputField 
                label="Email" 
                type="email" 
                register={register("email")} 
                error={errors.email?.message} 
                placeholder="Enter your email"
              />
              <InputField 
                label="First Name" 
                register={register("firstName")} 
                error={errors.firstName?.message} 
                placeholder="Enter your first name"
              />
              <InputField 
                label="Last Name" 
                register={register("lastName")} 
                error={errors.lastName?.message} 
                placeholder="Enter your last name"
              />
              <InputField 
                label="Password" 
                type="password" 
                register={register("password")} 
                error={errors.password?.message} 
                placeholder="Enter your password"
              />
              <InputField 
                label="Confirm Password" 
                type="password" 
                register={register("confirmPassword")} 
                error={errors.confirmPassword?.message} 
                placeholder="Confirm your password" 
              />
            </div>
            <center>
              <Button type="submit" className={styles.submitButton}>
                LASSGO
              </Button>
            </center>
            <p className={styles.footerText}>
              Already have an account? <Link to={PATHS.login} className={styles.link}>Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
