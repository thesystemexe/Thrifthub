import axios from "axios";

const api = new axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const login = async ({ email, password }) => {
  const response = await api.post("/api/auth/admin/login", {
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.get("/api/auth/admin/logout");
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/auth/admin/get-me", {
    withCredentials: true,
  });
  return response.data;
};
