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
  uploadAvatar(file, email) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("email", email); // Thêm email vào FormData
  
    return axiosInstance.post("/files/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  
};

export default profileService;
