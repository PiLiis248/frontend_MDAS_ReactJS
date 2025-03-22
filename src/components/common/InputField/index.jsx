import React from "react";
import styles from "../../../assets/InputField.module.css";

const InputField = ({ label, type = "text", register, value, onChange, checked, error, placeholder }) => {
  return (
    <div className={styles.inputContainer}>
      <label className={styles.label}>
        {type === "checkbox" ? (
          <>
            <input type="checkbox" {...(register ? register : { checked, onChange })} className={styles.checkbox} />
            {label}
          </>
        ) : (
          <>
            {label}
            <input
              type={type}
              {...(register ? register : { value, onChange })}
              className={styles.input}
              placeholder={placeholder}
            />
          </>
        )}
      </label>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default InputField;
