import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createReview,
  getProductDetail,
  getProducts,
  toggleFavorite as toggleFavoriteApi,
  clearFavoritesApi,
  getMyFavoritesApi,
} from "./productApi";

const initialState = {
  products: [],
  productCount: 0,
  isLoading: false,
  error: null,
  product: null,
  resultPerPage: 4,
  totalPages: 0,
  reviewSuccess: false,
  actionLoading: false,
  favoritesLoading: false,
  reviewLoading: false,
  favorites: [],
};

export const userGetProducts = createAsyncThunk(
  `product/get-all-products`,
  async ({ keyword, page = 1, category, era, tagSize, maxPrice }, thunkAPI) => {
    try {
      const response = await getProducts({
        keyword,
        page,
        category,
        era,
        tagSize,
        maxPrice,
      });

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userGetProductDetail = createAsyncThunk(
  `product/getProductDetail`,
  async (productId, thunkAPI) => {
    try {
      const response = await getProductDetail(productId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userCreateReview = createAsyncThunk(
  `product/createReview`,
  async ({ rating, comment, productId }, thunkAPI) => {
    try {
      const response = await createReview({ rating, comment, productId });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userToggleFavorite = createAsyncThunk(
  "product/toggleFavorite",
  async (productId, thunkAPI) => {
    try {
      return await toggleFavoriteApi(productId);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const userGetFavorites = createAsyncThunk(
  "product/getFavorites",
  async (_, thunkAPI) => {
    try {
      const response = await getMyFavoritesApi();

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const userClearFavorites = createAsyncThunk(
  "product/clearFavorites",
  async (_, thunkAPI) => {
    try {
      return await clearFavoritesApi();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    removeErrors: (state) => {
      state.error = null;
    },

    removeReviewSuccess: (state) => {
      state.reviewSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(userGetProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userGetProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.products = action.payload.products;
        state.productCount = action.payload.productCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(userGetProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
        state.products = [];
      })
      .addCase(userGetProductDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userGetProductDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.product = action.payload.product;
      })
      .addCase(userGetProductDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(userCreateReview.pending, (state) => {
        state.reviewLoading = true;
      })
      .addCase(userCreateReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.error = null;
        state.reviewSuccess = true;
        state.product = action.payload.product;
      })
      .addCase(userCreateReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(userToggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(userToggleFavorite.fulfilled, (state, action) => {
        const { productId, isFavorite } = action.payload;
        if (isFavorite) {
          const product = state.products.find(
            (item) => item._id.toString() === productId.toString(),
          );
          if (
            product &&
            !state.favorites.some(
              (item) => item._id.toString() === productId.toString(),
            )
          ) {
            state.favorites.push(product);
          }
        } else {
          state.favorites = state.favorites.filter(
            (item) => item._id.toString() !== productId.toString(),
          );
        }
      })
      .addCase(userToggleFavorite.rejected, (state, action) => {
        state.error = action.payload || "Couldn't update favorite";
      })

      .addCase(userGetFavorites.pending, (state) => {
        state.favoritesLoading = true;
        state.error = null;
      })
      .addCase(userGetFavorites.fulfilled, (state, action) => {
        state.favoritesLoading = false;
        state.favorites = action.payload.favorites;
      })
      .addCase(userGetFavorites.rejected, (state, action) => {
        state.favoritesLoading = false;
        state.error = action.payload;
      })

      .addCase(userClearFavorites.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(userClearFavorites.fulfilled, (state) => {
        state.actionLoading = false;
        state.favorites = [];
      })
      .addCase(userClearFavorites.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  removeErrors,
  removeReviewSuccess,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
} = productSlice.actions;

export default productSlice.reducer;
