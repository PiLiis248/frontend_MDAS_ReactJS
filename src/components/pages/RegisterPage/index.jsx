import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../common/InputField";
import "../../../assets/Auth.css";
import PATHS from "../../../constants/path";
import authService from "../../../services/authService"; 
import ResendConfirmationButton from "../../common/ResendConfirmationButton";
import Button from "../../common/Button";

// Schema kiểm tra đăng ký
const registerSchema = yup.object().shape({
  userName: yup.string()
    .required("Username is required")
    .min(6, "Username must be at least 6 characters")
    .max(50, "Username must be at most 50 characters"),
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
      const { confirmPassword, ...requestData } = data;
      setRegisteredEmail(data.email);

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

  return (
    <div className="authContainer">
      <div className="registerAuthBox">
        <h2 className="title">REGISTER</h2>

        {successMessage && (
          <>
            <p className="success">{successMessage}</p>
            <div className="buttonGroup">
              <ResendConfirmationButton 
                email={registeredEmail} 
                onSuccessMessageChange={setSuccessMessage} 
              />
              <Button className="loginButton" onClick={() => navigate(PATHS.login)}>
                Login
              </Button>
            </div>
          </>
        )}

        {error && <p className="error">{error}</p>}

        {!successMessage && (
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            <div className="gridContainer">
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
              <Button type="submit" className="submitButton">
                LASSGO
              </Button>
            </center>
            <p className="footerText">
              Already have an account? <Link to={PATHS.login} className="link">Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
