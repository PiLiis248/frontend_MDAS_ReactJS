import React, { useState } from "react";
import axiosInstance from "../../../api/axios";
import styles from "../../../assets/Auth.module.css";

const ResendConfirmationButton = ({ email }) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResendEmail = async () => {
    if (!email) {
      setError("No registered email found.");
      return;
    }

    try {
      const response = await axiosInstance.get(
        `/users/userRegistrationConfirmRequest?email=${email}`
      );

      if (response.status === 200) {
        setMessage("Confirmation email resent. Please check your email or spam folder!");
        setError("");
      } else {
        throw new Error(response.data?.message || "Failed to resend email");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.submitButton} onClick={handleResendEmail}>
        Resend Confirmation Link
      </button>
    </div>
  );
};

export default ResendConfirmationButton;
