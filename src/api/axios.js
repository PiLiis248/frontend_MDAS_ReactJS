import axios from "axios";
import tokenMethod from "./token";
import { BASE_URL } from "../constants/environments";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data: tokenData } = await axios.post("/refresh_token", {
          refreshToken: localStorage.getItem("refreshToken"),
        });
        tokenMethod.set(tokenData);
        originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;
        return axiosInstance(originalRequest);
      } catch (error) {
        tokenMethod.remove();
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenMethod.get()?.token;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;