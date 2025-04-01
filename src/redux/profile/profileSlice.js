// src/redux/features/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ProfileService from "../../services/profileService";
import authService from "../../services/authService";

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ProfileService.getProfile();
      let userData = response.data;

      if (userData.avatarUrl === null) {
        userData = { ...userData, avatarUrl: "Default/hearts.jpg" };
      }

      return userData;
    } catch (err) {
      console.error("Failed to load user profile");
      return rejectWithValue(err.response?.data || "Failed to load profile");
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async ({ file, email }, { rejectWithValue }) => {
    try {
      const response = await ProfileService.uploadAvatar(file, email);
      return response.data;
    } catch (err) {
      return rejectWithValue("Failed to update avatar");
    }
  }
);

export const changePassword = createAsyncThunk(
  "profile/changePassword",
  async ({ email, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await ProfileService.changePassword({
        email,
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to change password");
    }
  }
);

export const requestResetPassword = createAsyncThunk(
  "profile/requestResetPassword",
  async (email, { rejectWithValue }) => {
    try {
      await authService.requestResetPassword(email);
      return true;
    } catch (err) {
      return rejectWithValue("Failed to send reset password link");
    }
  }
);

const initialState = {
  user: {
    avatarUrl: "",
    userName: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
  },
  isProfileLoading: true,
  isAvatarUploading: false,
  isChangePasswordModalOpen: false,
  isResetPasswordLoading: false,
  isForgotPasswordLoading: false,
  passwordForm: {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    oldPasswordError: "",
    newPasswordError: "",
    confirmNewPasswordError: "",
  },
  toast: {
    message: "",
    type: "",
    isVisible: false,
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    togglePasswordModal: (state, action) => {
      state.isChangePasswordModalOpen = action.payload;
      // Reset form fields when closing modal
      if (!action.payload) {
        state.passwordForm = {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          oldPasswordError: "",
          newPasswordError: "",
          confirmNewPasswordError: "",
        };
      }
    },
    updatePasswordField: (state, action) => {
      const { field, value } = action.payload;
      state.passwordForm[field] = value;
    },
    setPasswordErrors: (state, action) => {
      const { oldPasswordError, newPasswordError, confirmNewPasswordError } =
        action.payload;
      state.passwordForm.oldPasswordError = oldPasswordError || "";
      state.passwordForm.newPasswordError = newPasswordError || "";
      state.passwordForm.confirmNewPasswordError =
        confirmNewPasswordError || "";
    },
    setToast: (state, action) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast.isVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isProfileLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isProfileLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isProfileLoading = false;
      })

      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isAvatarUploading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user.avatarUrl = action.payload;
        state.isAvatarUploading = false;
        state.toast = {
          message: "Avatar updated successfully!",
          type: "success",
          isVisible: true,
        };
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isAvatarUploading = false;
        state.toast = {
          message: action.payload,
          type: "error",
          isVisible: true,
        };
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isResetPasswordLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isResetPasswordLoading = false;
        state.toast = {
          message: "Password changed successfully!",
          type: "success",
          isVisible: true,
        };
        state.isChangePasswordModalOpen = false;

        state.passwordForm = {
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
          oldPasswordError: "",
          newPasswordError: "",
          confirmNewPasswordError: "",
        };
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isResetPasswordLoading = false;
        state.toast = {
          message: action.payload,
          type: "error",
          isVisible: true,
        };
      })

      // Request reset password
      .addCase(requestResetPassword.pending, (state) => {
        state.isForgotPasswordLoading = true;
      })
      .addCase(requestResetPassword.fulfilled, (state) => {
        state.isForgotPasswordLoading = false;
        state.toast = {
          message:
            "Reset password link has been sent to email. Please check email or spam!",
          type: "success",
          isVisible: true,
        };
      })
      .addCase(requestResetPassword.rejected, (state, action) => {
        state.isForgotPasswordLoading = false;
        state.toast = {
          message: action.payload,
          type: "error",
          isVisible: true,
        };
      });
  },
});

export const {
  togglePasswordModal,
  updatePasswordField,
  setPasswordErrors,
  setToast,
  clearToast,
} = profileSlice.actions;

export default profileSlice.reducer;
