import React, { useState } from "react";
import authService from "../../../services/authService";
import "../../../assets/Auth.css";

const ResendConfirmationButton = ({ email, onSuccessMessageChange }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResendEmail = async () => {
    if (!email) {
      setError("No registered email found.");
      return;
    }

    try {
      const response = await authService.resendConfirmationEmail(email);

      if (response.status === 200) {
        const successText = "Confirmation email resent. Please check your email or spam!";
        setMessage(successText);
        setError("");

        // Gọi hàm cập nhật successMessage bên RegisterPage
        if (onSuccessMessageChange) {
          onSuccessMessageChange(successText);
        }
      } else {
        throw new Error(response.data?.message || "Failed to resend email");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <button className="submitButton" onClick={handleResendEmail}>
        Resend Confirmation Link
      </button>
    </div>
  );
};

export default ResendConfirmationButton;
