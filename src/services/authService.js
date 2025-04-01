import axiosInstance from "../api/axios";
import tokenMethod from "../api/token";
import PATHS from "../constants/path";

const authService = {
  // ✅ Đăng nhập (Login)
  async login(username, password, rememberMe, setUser) {
    try {
        const response = await axiosInstance.post(
            `/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
        );

        const authData = {
            token: response.data.token,
            user: {
                userName: response.data.userName,
                email: response.data.email,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                role: response.data.role,
                status: response.data.status,
            },
        };

        // Lưu token dựa trên rememberMe
        tokenMethod.set(authData, rememberMe);

        // Gọi AuthContext để cập nhật trạng thái user
        setUser(authData);

        return authData;
    } catch (error) {
        let errorMessage = "Login failed";

        if (error.response) {
            if (error.response.status === 404) {
                errorMessage = "Server not found. Check API URL.";
            } else if (error.response.status === 401) {
                errorMessage = "Invalid username or password"; // ✅ Xử lý sai mật khẩu
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage); 
    }
  },

  // ✅ Đăng xuất (Logout)
  async logout(setUser) {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Xóa token và reset user
      tokenMethod.remove();
      setUser(null);
      window.location.href = PATHS.login;
    }
  },

  // ✅ Lấy thông tin người dùng
  getProfile() {
    return axiosInstance.get("/users/profile");
  },

  // ✅ Đăng ký tài khoản
  register(payload = {}) {
    return axiosInstance.post("/users", payload);
  },

  // ✅ Yêu cầu đặt lại mật khẩu
  requestResetPassword(email) {
    return axiosInstance.get(`/users/resetPasswordRequest?email=${email}`);
  },

  // ✅ Gửi lại yêu cầu đặt lại mật khẩu
  resendResetPassword(email) {
    return axiosInstance.get(`/users/resendResetPassword?email=${email}`);
  },

  // ✅ Gửi lại email xác nhận tài khoản
  resendConfirmationEmail(email) {
    return axiosInstance.get(`/users/userRegistrationConfirmRequest?email=${email}`);
  },

  // ✅ Đặt lại mật khẩu bằng token
  resetPassword(token, newPassword) {
    return axiosInstance.get(`/users/resetPassword?token=${token}&newPassword=${newPassword}`);
  }
};

export default authService;
