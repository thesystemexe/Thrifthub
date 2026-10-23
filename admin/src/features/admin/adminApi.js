import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const getAdminDashboard = async () => {
  const response = await api.get("/api/admin/dashboard");
  return response.data;
};

export const pendingVerificationsApi = async ({ page = 1, keyword = "" }) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }
  const response = await api.get(
    `/api/admin/seller-verification-pending?${params.toString()}`,
  );

  return response.data;
};

export const sellerVerificationApi = async (sellerId) => {
  const response = await api.get(`/api/admin/seller/${sellerId}`);
  return response.data;
};

export const sellerApprovalApi = async (sellerId) => {
  const response = await api.patch(`/api/admin/seller/${sellerId}/approve`);
  return response.data;
};

export const sellerRejectionApi = async ({ sellerId, rejection }) => {
  const response = await api.patch(`/api/admin/seller/${sellerId}/reject`, {
    rejection,
  });
  return response.data;
};

export const approvedSellersApi = async ({ page = 1, keyword = "" }) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }
  const response = await api.get(`/api/admin/sellers?${params.toString()}`);

  return response.data;
};

export const getAllProducts = async ({ page = 1, keyword = "" }) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }
  const response = await api.get(`/api/admin/products?${params.toString()}`);

  return response.data;
};

export const getProductDetail = async (productId) => {
  const response = await api.get(`/api/admin/product/${productId}`);
  return response.data;
};

export const updateProductStatus = async ({ productId, status }) => {
  const response = await api.patch(`/api/admin/product/${productId}`, {
    status,
  });
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/api/admin/product/${productId}`);
  return response.data;
};

export const getAllUsers = async ({ page = 1, keyword = "" }) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }
  const response = await api.get(`/api/admin/users?${params.toString()}`);

  return response.data;
};

export const getUserDetail = async (userId) => {
  const response = await api.get(`/api/admin/user/${userId}`);
  return response.data;
};

export const updateUserRole = async ({ userId, roles }) => {
  const response = await api.put(`api/admin/user/${userId}`, { roles });
  return response.data;
};

export const updateUserStatus = async ({ userId, accountStatus }) => {
  const response = await api.patch(`/api/admin/user/${userId}/status`, {
    accountStatus,
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/api/admin/user/${userId}`);
  return response.data;
};

export const getAllOrders = async ({ keyword = "", page = 1 }) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (keyword) {
    params.set("keyword", keyword);
  }
  const link = `/api/admin/orders?${params.toString()}`;
  const response = await api.get(link);
  return response.data;
};

export const getSingleOrder = async (orderId) => {
  const response = await api.get(`/api/admin/order/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async ({ orderId, itemId, orderStatus }) => {
  const response = await api.patch(
    `/api/admin/order/${orderId}/item/${itemId}/status`,
    { orderStatus },
  );
  return response.data;
};

export const getAllReviews = async (page = 1) => {
  const response = await api.get(`/api/product/admin/reviews?page=${page}`);
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/api/product/${productId}/reviews`);
  return response.data;
};

export const deleteReview = async ({ productId, reviewId }) => {
  const response = await api.delete(
    `/api/product/${productId}/admin/review/${reviewId}`,
  );

  return response.data;
};
