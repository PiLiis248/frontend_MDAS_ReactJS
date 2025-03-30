import React, { useState } from "react";
import "../../../assets/InputField.css";

const InputField = ({ label, type = "text", register, value, onChange, checked, error, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine if this is a password field that needs a toggle
  const isPassword = type === "password";
  
  // Determine the actual input type to use
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="inputContainer">
      <label className="label">
        {type === "checkbox" ? (
          <>
            <input type="checkbox" {...(register ? register : { checked, onChange })} className="checkbox" />
            {label}
          </>
        ) : (
          <>
            {label}
            <div className="password-input-wrapper">
              <input
                type={inputType}
                {...(register ? register : { value, onChange })}
                className={`input ${isPassword ? 'password-input' : ''}`}
                placeholder={placeholder}
              />
              {isPassword && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
          </>
        )}
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default InputField;