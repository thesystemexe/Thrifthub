import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

// Get My Orders
export const getAllMyOrders = async () => {
  const response = await api.get("/api/orders/user");
  return response.data;
};

// Get Single Order
export const getAOrder = async (orderId) => {
  const response = await api.get(`/api/order/${orderId}`);
  return response.data;
};

/**
 * Submit fit feedback for a delivered order item
 */
export const submitFitFeedback = async (orderId, itemId, feedback) => {
  const response = await api.post(
    `/api/orders/${orderId}/items/${itemId}/fit-feedback`,
    feedback,
  );

  return response.data;
};
