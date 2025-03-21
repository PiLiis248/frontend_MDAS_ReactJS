import React from "react";
import styles from "../../../assets/InputField.module.css";

const InputField = ({ label, type = "text", register, error, placeholder }) => {
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        {...register}
        className={styles.input}
        placeholder={placeholder} // Thêm placeholder
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default InputField;
