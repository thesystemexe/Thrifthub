import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const addToCartProduct = async ({ productId, quantity }) => {
  const response = await api.post(`/api/product/user/addToCart`, {
    productId,
    quantity,
  });
  return response.data;
};

export const getMyCart = async () => {
  const response = await api.get("/api/product/user/cart");
  return response.data;
};

export const updateCartQuantity = async ({ productId, quantity }) => {
  const response = await api.patch(`/api/product/user/cart/${productId}`, {
    quantity,
  });

  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/api/product/user/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/api/product/user/cart");
  return response.data;
};
