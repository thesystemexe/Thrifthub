import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const register = async ({ username, email, password }) => {
  const response = await api.post("api/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post("api/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("api/auth/logout", { withCredentials: true });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("api/auth/user-data");
  return response.data;
};

export const sendVerifyOtp = async () => {
  const response = await api.post("api/auth/send-verify-otp");
  return response.data;
};

export const verifyEmail = async (otp) => {
  const response = await api.post("api/auth/verify-account", { otp });
  return response.data;
};

export const SendResetOtp = async (email) => {
  const response = await api.post("api/auth/send-reset-otp", { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await api.post("api/auth/verify-reset-otp", { email, otp });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post("api/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};
