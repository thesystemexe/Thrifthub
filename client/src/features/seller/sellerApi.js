import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const sellerApplicationForm = async (data) => {
  const response = await api.post("api/seller/register", data);
  return response.data;
};

export const getSellerProfile = async () => {
  const response = await api.get("api/seller/profile");
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("api/product/create-product", productData);
  return response.data;
};

export const getAllProducts = async ({ keyword, page = 1, category }) => {
  const params = new URLSearchParams();
  params.set("page", page);

  if (keyword) {
    params.set("keyword", keyword);
  }
  if (category) {
    params.set("category", category);
  }
  const link = `/api/seller/products?${params.toString()}`;
  const response = await api.get(link);
  return response.data;
};

export const updateProduct = async ({ productId, productData }) => {
  const response = await api.put(
    `api/product/update-product/${productId}`,
    productData,
  );
  return response.data;
};

export const getSingleProduct = async (productId) => {
  const response = await api.get(`api/seller/get-single-product/${productId}`);

  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`api/product/delete-product/${productId}`);
  return response.data;
};

export const getAllOrders = async ({ keyword, page = 1 }) => {
  const params = new URLSearchParams();
  params.set("page", page);

  if (keyword) {
    params.set("keyword", keyword);
  }

  const link = `/api/seller/orders?${params.toString()}`;
  const response = await api.get(link);
  return response.data;
};

export const getSingleOrder = async (orderId) => {
  const response = await api.get(`/api/seller/order/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async ({ orderId, itemId, orderStatus }) => {
  const response = await api.patch(
    `/api/seller/order/${orderId}/item/${itemId}/status`,
    { orderStatus },
  );

  return response.data;
};
