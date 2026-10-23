import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getAllMyOrders, getAOrder } from "./orderApi";

const initialState = {
  isSuccess: false,
  error: null,
  message: null,
  isLoading: false,
  orders: [],
  order: {},
};

// ============================================================
// Create Order
// ============================================================

export const userCreateOrder = createAsyncThunk(
  "order/createNewOrder",
  async (order, thunkAPI) => {
    try {
      const response = await createOrder(order);

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Order creation failed",
      );
    }
  },
);

// ============================================================
// Get My Orders
// ============================================================

export const userGetAllMyOrders = createAsyncThunk(
  "order/getAllMyOrders",
  async (_, thunkAPI) => {
    try {
      const response = await getAllMyOrders();

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders",
      );
    }
  },
);

// ============================================================
// Get Single Order
// ============================================================

export const userGetAOrder = createAsyncThunk(
  "order/getAOrder",
  async (orderId, thunkAPI) => {
    try {
      const response = await getAOrder(orderId);

      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch order",
      );
    }
  },
);

const orderSlice = createSlice({
  name: "order",

  initialState,

  reducers: {
    removeError: (state) => {
      state.error = null;
    },

    removeSuccess: (state) => {
      state.isSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // GET ALL ORDERS
      // ======================================================

      .addCase(userGetAllMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(userGetAllMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;

        state.orders = action.payload?.orders || [];

        state.error = null;
      })

      .addCase(userGetAllMyOrders.rejected, (state, action) => {
        state.isLoading = false;

        state.error = action.payload || "Failed to fetch orders";
      })

      // ======================================================
      // GET SINGLE ORDER
      // ======================================================

      .addCase(userGetAOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(userGetAOrder.fulfilled, (state, action) => {
        state.isLoading = false;

        state.order = action.payload?.order || {};

        state.error = null;
      })

      .addCase(userGetAOrder.rejected, (state, action) => {
        state.isLoading = false;

        state.error = action.payload || "Failed to fetch order";
      });
  },
});

export const { removeError, removeSuccess } = orderSlice.actions;

export default orderSlice.reducer;
