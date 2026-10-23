import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createProduct,
  getAllProducts,
  getSellerProfile,
  sellerApplicationForm,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
} from "./sellerApi";

const initialState = {
  profile: [],

  product: {},
  products: [],

  order: {},
  orders: [],

  productCount: 0,
  orderCount: 0,

  resultPerPage: 4,
  totalPages: 0,
  currentPage: 1,

  isSuccess: false,
  isLoading: false,
  actionLoading: false,
  isSubmitting: false,

  error: null,
  message: "",
  deleting: {},
};

export const submitSellerApplicationForm = createAsyncThunk(
  `seller/sellerApplicationForm`,
  async (formData, thunkAPI) => {
    try {
      const response = await sellerApplicationForm(formData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerProfile = createAsyncThunk(
  `seller/profile`,
  async (_, thunkAPI) => {
    try {
      const response = await getSellerProfile();
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerCreateProduct = createAsyncThunk(
  "seller/createProduct",
  async (productData, thunkAPI) => {
    try {
      const response = await createProduct(productData);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerSingleProduct = createAsyncThunk(
  "seller/singleProduct",
  async (productId, thunkAPI) => {
    try {
      const response = await getSingleProduct(productId);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerProducts = createAsyncThunk(
  `seller/products`,
  async ({ keyword, page = 1, category }, thunkAPI) => {
    try {
      const response = await getAllProducts({ keyword, page, category });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerUpdateProduct = createAsyncThunk(
  `seller/updateProduct`,
  async ({ productId, productData }, thunkAPI) => {
    try {
      const response = await updateProduct({ productId, productData });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerDeleteProduct = createAsyncThunk(
  `seller/deleteProduct`,
  async (productId, thunkAPI) => {
    try {
      const response = await deleteProduct(productId);
      return { productId };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerOrders = createAsyncThunk(
  `seller/orders`,
  async ({ keyword, page = 1 }, thunkAPI) => {
    try {
      const response = await getAllOrders({ keyword, page });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerSingleOrder = createAsyncThunk(
  "seller/singleOrder",
  async (orderId, thunkAPI) => {
    try {
      const response = await getSingleOrder(orderId);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const sellerUpdateOrderStatus = createAsyncThunk(
  "seller/updateOrderStatus",
  async ({ orderId, itemId, orderStatus }, thunkAPI) => {
    try {
      const response = await updateOrderStatus({
        orderId,
        itemId,
        orderStatus,
      });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    restSellerProfile: (state) => {
      state.profile = [];
    },

    removeErrors: (state) => {
      state.error = null;
    },

    removeSuccess: (state) => {
      state.isSuccess = null;
    },

    clearSelectedOrder: (state) => {
      state.order = null;
      state.error = null;
      state.isSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(submitSellerApplicationForm.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitSellerApplicationForm.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.profile = action.payload.profile;
        state.message =
          action.payload?.message ||
          "seller application submitted successfully";
      })
      .addCase(submitSellerApplicationForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Application submission failed";
      })
      .addCase(sellerProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sellerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.sellerProfile;
      })
      .addCase(sellerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profile = null;
        state.error = action.payload || "couldn't fetched profile of recruiter";
      })
      .addCase(sellerCreateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sellerCreateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload.product);
        state.isSuccess = true;
      })
      .addCase(sellerCreateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "couldn't create product";
      })
      .addCase(sellerSingleProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(sellerSingleProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload.product;
      })

      .addCase(sellerSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Couldn't fetch product";
      })
      .addCase(sellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.productCount = action.payload.productCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(sellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Couldn't fetch seller products";
      })
      .addCase(sellerUpdateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sellerUpdateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload.product;
      })
      .addCase(sellerUpdateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Couldn't Update product";
      })
      .addCase(sellerDeleteProduct.pending, (state, action) => {
        const productId = action.meta.arg;
        state.deleting[productId] = true;
        state.error = null;
      })

      .addCase(sellerDeleteProduct.fulfilled, (state, action) => {
        const productId = action.payload.productId;
        state.deleting[productId] = false;
        state.products = state.products.filter(
          (product) => product._id !== productId,
        );
        state.productCount = Math.max(0, state.productCount - 1);
        state.isSuccess = true;
        state.message = "Product deleted successfully";
      })
      .addCase(sellerDeleteProduct.rejected, (state, action) => {
        const productId = action.meta.arg;
        state.deleting[productId] = false;
        state.error = action.payload || "Couldn't delete product";
      })
      .addCase(sellerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.orderCount = action.payload.orderCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(sellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Couldn't fetch seller orders";
      })
      .addCase(sellerSingleOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sellerSingleOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload.order;
      })
      .addCase(sellerSingleOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Couldn't fetch order";
      })
      .addCase(sellerUpdateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(sellerUpdateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isSuccess = true;
        const updatedOrder = action.payload.order;
        // Single order page
        state.order = updatedOrder;
        // Seller orders list
        const index = state.orders.findIndex(
          (order) => order._id === updatedOrder._id,
        );
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(sellerUpdateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.isSuccess = false;
        state.error = action.payload || "Couldn't update order status";
      });
  },
});

export const {
  restSellerProfile,
  removeErrors,
  removeSuccess,
  clearSelectedOrder,
} = sellerSlice.actions;

export default sellerSlice.reducer;
