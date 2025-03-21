import axiosInstance from "../api/axios";

export const authService = {
  login(payload = {}) {
    return axiosInstance.post("/login", payload);
  },
  getProfile() {
    return axiosInstance.get("/users/profile");
  },
};

export default authService;