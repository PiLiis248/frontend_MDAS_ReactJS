import React from "react";

const Button = ({ type = "button", onClick, children, disabled, className }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={className} 
    >
      {children}
    </button>
  );
};

export default Button;
