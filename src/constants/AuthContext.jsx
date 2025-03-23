import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  const login = async (username, password, rememberMe) => {
    try {
      const response = await axiosInstance.post(`/login?username=${username}&password=${password}`);
      const userData = response.data;

      if (userData.status !== "ACTIVE") {
        throw new Error("Your account is not activated. Please check your email for activation.");
      }

      if (!userData.token) {
        throw new Error("Authentication failed. Please try again.");
      }

      setUser(userData);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Invalid username or password");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
// Export mặc định để tránh lỗi import
export default AuthContext;