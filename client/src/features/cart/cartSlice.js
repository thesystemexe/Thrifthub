import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  addToCartProduct,
  getMyCart,
  updateCartQuantity as updateCartQuantityApi,
  removeFromCart,
  clearCart as clearCartApi,
} from "./cartApi";

const initialState = {
  // MongoDB is the source of truth.
  // Redux only stores the current UI copy.
  cartItems: [],

  isLoading: false,
  actionLoading: false,

  isSuccess: false,

  error: null,
  message: null,

  // Used when removing a specific product
  removingId: null,

  shippingInfo: JSON.parse(localStorage.getItem("shippingInfo")) || {},
};

// ======================================================
// GET CART
// ======================================================

export const userGetCart = createAsyncThunk(
  "cart/getCart",
  async (_, thunkAPI) => {
    try {
      const response = await getMyCart();

      return response.cartData || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch cart",
      );
    }
  },
);

// ======================================================
// ADD TO CART
// ======================================================

export const userAddToCartProduct = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const response = await addToCartProduct({
        productId,
        quantity,
      });

      return response.cartData || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add product to cart",
      );
    }
  },
);

// ======================================================
// UPDATE CART QUANTITY
// ======================================================

export const userUpdateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ productId, quantity }, thunkAPI) => {
    try {
      const response = await updateCartQuantityApi({
        productId,
        quantity,
      });

      return response.cartData || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update cart quantity",
      );
    }
  },
);

// ======================================================
// REMOVE ONE PRODUCT
// ======================================================

export const userRemoveFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, thunkAPI) => {
    try {
      const response = await removeFromCart(productId);

      return {
        cartData: response.cartData || [],
        productId,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove product from cart",
      );
    }
  },
);

// ======================================================
// CLEAR ENTIRE CART
// ======================================================

export const userClearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      const response = await clearCartApi();

      return response.cartData || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to clear cart",
      );
    }
  },
);

// ======================================================
// SLICE
// ======================================================

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    // --------------------------------------------------
    // CLEAR ERROR
    // --------------------------------------------------

    removeError: (state) => {
      state.error = null;
    },

    // --------------------------------------------------
    // CLEAR MESSAGE
    // --------------------------------------------------

    removeMessage: (state) => {
      state.message = null;
    },

    // --------------------------------------------------
    // SAVE SHIPPING INFO
    // --------------------------------------------------

    saveShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },

    // --------------------------------------------------
    // CLEAR SHIPPING INFO ONLY
    // --------------------------------------------------

    clearShippingInfo: (state) => {
      state.shippingInfo = {};

      localStorage.removeItem("shippingInfo");
    },

    // --------------------------------------------------
    // RESET SUCCESS STATE
    // --------------------------------------------------

    resetCartSuccess: (state) => {
      state.isSuccess = false;
    },
  },

  // ====================================================
  // ASYNC THUNKS
  // ====================================================

  extraReducers: (builder) => {
    builder

      // =================================================
      // GET CART
      // =================================================

      .addCase(userGetCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(userGetCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload;
        state.error = null;
      })

      .addCase(userGetCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch cart";
      })

      // =================================================
      // ADD TO CART
      // =================================================

      .addCase(userAddToCartProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.isSuccess = false;
        state.message = null;
      })

      .addCase(userAddToCartProduct.fulfilled, (state, action) => {
        state.actionLoading = false;

        // Backend returns the complete current cart.
        // Replace Redux cart with backend state.
        state.cartItems = action.payload;

        state.error = null;
        state.isSuccess = true;
        state.message = "Cart updated successfully";
      })

      .addCase(userAddToCartProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to add product to cart";
        state.isSuccess = false;
      })

      // =================================================
      // UPDATE QUANTITY
      // =================================================

      .addCase(userUpdateCartQuantity.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.isSuccess = false;
      })

      .addCase(userUpdateCartQuantity.fulfilled, (state, action) => {
        state.actionLoading = false;

        // Again, trust the backend response as the
        // latest cart state.
        state.cartItems = action.payload;

        state.error = null;
        state.isSuccess = true;
        state.message = "Cart quantity updated";
      })

      .addCase(userUpdateCartQuantity.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to update cart quantity";

        state.isSuccess = false;
      })

      // =================================================
      // REMOVE ONE PRODUCT
      // =================================================

      .addCase(userRemoveFromCart.pending, (state, action) => {
        state.actionLoading = true;
        state.removingId = action.meta.arg;
        state.error = null;
      })

      .addCase(userRemoveFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.removingId = null;

        state.cartItems = action.payload.cartData;

        state.error = null;
        state.isSuccess = true;
        state.message = "Product removed from cart";
      })

      .addCase(userRemoveFromCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.removingId = null;

        state.error = action.payload || "Failed to remove product from cart";

        state.isSuccess = false;
      })

      // =================================================
      // CLEAR CART
      // =================================================

      .addCase(userClearCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(userClearCart.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.cartItems = action.payload;

        state.error = null;
        state.isSuccess = true;
        state.message = "Cart cleared successfully";
      })

      .addCase(userClearCart.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to clear cart";
      });
  },
});

export const {
  removeError,
  removeMessage,
  saveShippingInfo,
  clearShippingInfo,
  resetCartSuccess,
} = cartSlice.actions;

export default cartSlice.reducer;
