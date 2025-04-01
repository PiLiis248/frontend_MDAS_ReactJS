import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import authService from "../../../services/authService";
import "../../../assets/Auth.css";
import Button from "../Button";
import InputField from "../InputField"; 

// Yup Schema for email validation
const schema = yup.object().shape({
  email: yup.string()
    .email("Invalid email")
    .min(6, "Email must be at least 6 characters")
    .max(50, "Email must be at most 50 characters")
    .required("Email is required"),
});

const ResendConfirmationForm = ({ email: propEmail, onSuccessMessageChange }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: propEmail || "" },
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [email, setEmail] = useState(propEmail || ""); // Track email input

  const handleResendEmail = async (formData) => {
    const emailToSend = email || formData.email;

    console.log("Form Data:", formData.email); // Debugging
  console.log("State Email:", email); 

    if (!emailToSend) {
      setError("No registered email found.");
      return;
    }

    try {
      setIsResendLoading(true);
      const response = await authService.resendConfirmationEmail(emailToSend);

      if (response.status === 200) {
        const successText = "Confirmation email resent. Please check your email or spam!";
        setMessage(successText);
        setError("");

        if (onSuccessMessageChange) {
          onSuccessMessageChange(successText);
        }
      } else {
        throw new Error(response.data?.message || "Failed to resend email");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form onSubmit={handleSubmit(handleResendEmail)}>
        {!propEmail && ( 
          <InputField 
            // label="Email"
            register={register("email")}
            error={errors.userName?.message}
            placeholder="Enter your email"
          />
        )}

        <Button className="submitResendButton" type="submit" disabled={isResendLoading}>
          {isResendLoading ? (
            <span className="loading-indicator">
              <span className="loading-spinner"></span> Processing...
            </span>
          ) : (
            "Resend Confirmation Link"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResendConfirmationForm;
