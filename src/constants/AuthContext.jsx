import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

// Create context with a default value
const AuthContext = createContext({
  user: null,
  login: () => Promise.reject("Not initialized"),
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => tokenMethod.get() || null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = tokenMethod.get();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (username, password, rememberMe) => {
    try {
      const userData = await authService.login(username, password, rememberMe, setUser);

      if (!userData) {
        throw new Error("Your account has not been registered !");
      }

      if (userData.user.status !== "ACTIVE") {
        throw new Error("Your account is not activated. Please check your email.");
      }

      navigate(PATHS.manageGroup);
      return userData;
    } catch (error) {
      throw new Error(error.message || "Invalid username or password");
    }
  };

  const logout = async () => {
    await authService.logout(setUser);
    navigate(PATHS.login);
  };

  // Provide the context value
  const contextValue = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Throw an error if useAuth is used outside of an AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;