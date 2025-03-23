import axiosInstance from "../api/axios";

const profileService = {
  getProfile() {
     return axiosInstance.get("/users/profile");
  },
  updateProfile(payload = {}) {
    return axiosInstance.put("/users/profile", payload);
  },
  changePassword(payload = {}) {
    return axiosInstance.put("/users/changePassword", payload);
  },
  uploadAvatar(file) {
    return axiosInstance.post("/files/image", file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default profileService;
