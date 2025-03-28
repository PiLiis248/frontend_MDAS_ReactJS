import React from "react";

const Button = ({ 
  type = "button", 
  onClick, 
  children, 
  disabled = false, 
  className = "" 
}) => {
  // Handle click only if not disabled
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      type={type} 
      onClick={handleClick} 
      disabled={disabled} 
      className={`${className} ${disabled ? 'disabled-btn' : ''}`} 
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </button>
  );
};

export default Button;