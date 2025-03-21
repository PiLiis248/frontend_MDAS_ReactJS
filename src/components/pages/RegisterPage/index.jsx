import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import styles from "../../../assets/Auth.module.css";
import PATHS from "../../../constants/path";

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
  const [registeredEmail, setRegisteredEmail] = useState(""); // Lưu email của user vừa đăng ký
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log("Register Data:", data);

      const { confirmPassword, ...requestData } = data;
      setRegisteredEmail(data.email); // Lưu email để dùng cho "Resend Confirmation"

      // Gọi API để đăng ký tài khoản
      const response = await fetch("http://localhost:8080/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.text();
      if (!response.ok) throw new Error(result.message || "Registration failed");

      // Hiển thị thông báo thành công, không tự động chuyển trang
      setSuccessMessage(result);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) {
      setError("No registered email found.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/v1/users/userRegistrationConfirmRequest?email=${registeredEmail}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      const result = await response.text();
      if (!response.ok) throw new Error(result || "Failed to resend email");
  
      setSuccessMessage("Registered email has been resent. Please check email or spam !");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };
  

  return (
    <div className={styles.authContainer}>
      <div className={styles.registerAuthBox}>
        <h2 className={styles.title}>Register</h2>

        {/* Hiển thị thông báo thành công */}
        {successMessage && (
          <>
            <p className={styles.success}>{successMessage}</p>
            <div className={styles.buttonGroup}>
              <button className={styles.submitButton} onClick={handleResendEmail}>
                Resend Confirmation Link
              </button>
              <button className={styles.loginButton} onClick={() => navigate(PATHS.login)}>
                Login
              </button>
            </div>
          </>
        )}

        {/* Hiển thị thông báo lỗi */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Ẩn form nếu đăng ký thành công */}
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
              <button type="submit" className={styles.submitButton}>Register</button>
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
