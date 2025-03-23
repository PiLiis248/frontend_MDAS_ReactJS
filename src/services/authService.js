import axiosInstance from "../api/axios";

export const authService = {
  login(payload = {}) {
    return axiosInstance.post("/login", payload);
  },
  getProfile() {
    return axiosInstance.get("/users/profile");
  },
  register(payload = {}) { 
    return axiosInstance.post("/users", payload);
  },
  requestResetPassword(email) {
    return axiosInstance.get(`/users/resetPasswordRequest?email=${email}`);
  },
  resendResetPassword(email) {
    return axiosInstance.get(`/users/resendResetPassword?email=${email}`);
  },
  resendConfirmationEmail(email) {
    return axiosInstance.get(`/users/userRegistrationConfirmRequest?email=${email}`);
  },
  resetPassword(token, newPassword) {
    return axiosInstance.get(`/users/resetPassword?token=${token}&newPassword=${newPassword}`);
  }
};

export default authService;
