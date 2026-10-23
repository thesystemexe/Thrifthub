import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4007",
  withCredentials: true,
});

export const getProducts = async ({
  keyword,
  page = 1,
  category,
  era,
  tagSize,
  maxPrice,
}) => {
  const params = new URLSearchParams();

  params.set("page", page);

  if (keyword) {
    params.set("keyword", keyword);
  }

  if (category) {
    params.set("category", category);
  }

  if (era) {
    params.set("era", era);
  }

  if (tagSize) {
    params.set("tagSize", tagSize);
  }

  if (maxPrice) {
    params.set("price[lte]", maxPrice);
  }

  const link = `/api/product/get-all-products?${params.toString()}`;

  const response = await api.get(link);

  return response.data;
};

export const getProductDetail = async (productId) => {
  const response = await api.get(`/api/product/${productId}`);
  return response.data;
};

export const createReview = async ({ rating, comment, productId }) => {
  const response = await api.put(`/api/product/review`, {
    rating,
    comment,
    productId,
  });
  return response.data;
};

export const toggleFavorite = async (productId) => {
  const response = await api.patch(`/api/product/favorite/${productId}`);
  return response.data;
};

export const getMyFavoritesApi = async () => {
  const response = await api.get("/api/product/favorites");
  return response.data;
};

export const clearFavoritesApi = async () => {
  const response = await api.delete("/api/product/user/favorites/clear");
  return response.data;
};

export const searchProductsByImage = async (imageFile, limit = 12) => {
  const formData = new FormData();

  formData.append("image", imageFile);

  const response = await api.post(
    `/api/visual-search/search?limit=${limit}`,
    formData,
  );

  return response.data;
};
