import React from "react";
import "../../../assets/InputField.css";

const InputField = ({ label, type = "text", register, value, onChange, checked, error, placeholder }) => {
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
            <input
              type={type}
              {...(register ? register : { value, onChange })}
              className="input"
              placeholder={placeholder}
            />
          </>
        )}
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default InputField;
