import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  pendingVerificationsApi,
  sellerVerificationApi,
  sellerApprovalApi,
  sellerRejectionApi,
  approvedSellersApi,
  getAllProducts,
  getProductDetail,
  deleteProduct,
  updateProductStatus,
  getAllUsers,
  getUserDetail,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  getAllReviews,
  getProductReviews,
  deleteReview,
  getAdminDashboard,
} from "./adminApi";

/* ============================================================
   ASYNC THUNKS
============================================================ */

/* ============================================================
   ADMIN DASHBOARD
============================================================ */

export const adminGetDashboard = createAsyncThunk(
  "admin/getDashboard",
  async (_, thunkAPI) => {
    try {
      return await getAdminDashboard();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* ============================================================
   PENDING SELLERS
============================================================ */

export const fetchPendingVerifications = createAsyncThunk(
  "admin/fetchPendingVerifications",

  async ({ page = 1, keyword = "" } = {}, thunkAPI) => {
    try {
      const data = await pendingVerificationsApi({
        page,
        keyword,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending requests",
      );
    }
  },
);

/* ============================================================
   SELLER DETAILS
============================================================ */

export const fetchSellerDetails = createAsyncThunk(
  "admin/fetchSellerDetails",

  async (sellerId, thunkAPI) => {
    try {
      const data = await sellerVerificationApi(sellerId);

      return data.seller;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller details",
      );
    }
  },
);

/* ============================================================
   APPROVE SELLER
============================================================ */

export const approveSeller = createAsyncThunk(
  "admin/approveSeller",

  async (sellerId, thunkAPI) => {
    try {
      await sellerApprovalApi(sellerId);

      return sellerId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to approve seller",
      );
    }
  },
);

/* ============================================================
   REJECT SELLER
============================================================ */

export const rejectSeller = createAsyncThunk(
  "admin/rejectSeller",

  async ({ sellerId, rejection }, thunkAPI) => {
    try {
      await sellerRejectionApi({
        sellerId,
        rejection,
      });

      return sellerId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reject seller",
      );
    }
  },
);

/* ============================================================
   APPROVED SELLERS
============================================================ */

export const fetchApprovedSellers = createAsyncThunk(
  "admin/approvedSellers",

  async ({ page = 1, keyword = "" } = {}, thunkAPI) => {
    try {
      const data = await approvedSellersApi({
        page,
        keyword,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch approved sellers",
      );
    }
  },
);

/* ============================================================
   GET ALL PRODUCTS
============================================================ */

export const adminGetProducts = createAsyncThunk(
  "admin/getAllProducts",

  async ({ page = 1, keyword = "" } = {}, thunkAPI) => {
    try {
      const data = await getAllProducts({
        page,
        keyword,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

/* ============================================================
   PRODUCT DETAILS
============================================================ */

export const adminGetProductDetail = createAsyncThunk(
  "admin/getProductDetail",

  async (productId, thunkAPI) => {
    try {
      const data = await getProductDetail(productId);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch product",
      );
    }
  },
);

/* ============================================================
   UPDATE PRODUCT STATUS
============================================================ */

export const adminUpdateProductStatus = createAsyncThunk(
  "admin/updateProductStatus",

  async ({ productId, status }, thunkAPI) => {
    try {
      const data = await updateProductStatus({
        productId,
        status,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update product status",
      );
    }
  },
);

/* ============================================================
   DELETE PRODUCT
============================================================ */

export const adminDeleteProduct = createAsyncThunk(
  "admin/deleteProduct",

  async (productId, thunkAPI) => {
    try {
      const data = await deleteProduct(productId);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  },
);

export const adminGetUsers = createAsyncThunk(
  "admin/getAllUsers",

  async ({ page = 1, keyword = "" } = {}, thunkAPI) => {
    try {
      const data = await getAllUsers({
        page,
        keyword,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

export const adminGetUserDetail = createAsyncThunk(
  "admin/getUserDetail",

  async (productId, thunkAPI) => {
    try {
      const data = await getUserDetail(productId);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const adminUpdateUserRole = createAsyncThunk(
  "admin/updateUserRole",

  async ({ userId, roles }, thunkAPI) => {
    try {
      const data = await updateUserRole({
        userId,
        roles,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update user roles",
      );
    }
  },
);

export const adminUpdateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",

  async ({ userId, accountStatus }, thunkAPI) => {
    try {
      const data = await updateUserStatus({
        userId,
        accountStatus,
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  },
);

export const adminDeleteUser = createAsyncThunk(
  "admin/deleteUser",

  async (userId, thunkAPI) => {
    try {
      const data = await deleteUser(userId);

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

export const adminGetAllOrders = createAsyncThunk(
  "admin/getAllOrders",
  async ({ keyword = "", page = 1 }, thunkAPI) => {
    try {
      const response = await getAllOrders({
        keyword,
        page,
      });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const adminGetSingleOrder = createAsyncThunk(
  "admin/getSingleOrder",
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

export const adminUpdateOrderStatus = createAsyncThunk(
  "admin/updateOrderStatus",
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

// Reviews
export const adminGetAllReviews = createAsyncThunk(
  "admin/getAllReviews",
  async (page = 1, thunkAPI) => {
    try {
      return await getAllReviews(page);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const adminGetProductReviews = createAsyncThunk(
  "admin/getProductReviews",
  async (productId, thunkAPI) => {
    try {
      const response = await getProductReviews(productId);

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const adminDeleteReview = createAsyncThunk(
  "admin/deleteReview",
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const response = await deleteReview({
        productId,
        reviewId,
      });

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* ============================================================
   INITIAL STATE
============================================================ */

const initialState = {
  /* ----------------------------------------------------------
   Dashboard
---------------------------------------------------------- */

  dashboard: {
    totalUsers: 0,
    totalProducts: 0,
    pendingSellers: 0,
    approvedSellers: 0,
    totalOrders: 0,
    totalReviews: 0,
  },

  orderChart: [],

  dashboardLoading: false,
  /* ----------------------------------------------------------
     Pending sellers
  ---------------------------------------------------------- */

  pendingSellers: [],

  /* ----------------------------------------------------------
     Approved sellers
  ---------------------------------------------------------- */

  approvedSellers: [],

  /* ----------------------------------------------------------
     Products
  ---------------------------------------------------------- */

  products: [],

  /* ----------------------------------------------------------
     Users
  ---------------------------------------------------------- */

  users: [],

  /* ----------------------------------------------------------
     Orders
  ---------------------------------------------------------- */

  orders: [],

  selectedOrder: null,

  orderCount: 0,

  /* ----------------------------------------------------------
     Reviews
  ---------------------------------------------------------- */
  reviews: [],
  reviewCount: 0,
  selectedProductReviews: [],

  /* ----------------------------------------------------------
     Selected seller
  ---------------------------------------------------------- */

  selectedSeller: null,

  /* ----------------------------------------------------------
     Selected product
  ---------------------------------------------------------- */

  selectedProduct: null,

  /* ----------------------------------------------------------
     Selected user
  ---------------------------------------------------------- */

  selectedUser: null,

  /* ----------------------------------------------------------
     Generic pagination
  ---------------------------------------------------------- */

  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
  resultPerPage: 6,

  /* ----------------------------------------------------------
     Separate loading states
  ---------------------------------------------------------- */

  sellerLoading: false,
  productsLoading: false,
  actionLoading: false,
  usersLoading: false,
  ordersLoading: false,
  reviewsLoading: false,
  dashboardLoading: false,

  /* ----------------------------------------------------------
     Error
  ---------------------------------------------------------- */

  error: null,
};

/* ============================================================
   SLICE
============================================================ */

const adminSlice = createSlice({
  name: "admin",

  initialState,

  reducers: {
    clearSelectedSeller: (state) => {
      state.selectedSeller = null;
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    clearAdminError: (state) => {
      state.error = null;
    },

    removeErrors: (state) => {
      state.error = null;
    },

    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
      state.error = null;
    },

    clearSelectedProductReviews: (state) => {
      state.selectedProductReviews = [];
      state.selectedProduct = null;
    },
  },

  /* ==========================================================
     EXTRA REDUCERS
  ========================================================== */

  extraReducers: (builder) => {
    builder

      /* ======================================================
   ADMIN DASHBOARD
====================================================== */
      .addCase(adminGetDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.error = null;
      })

      .addCase(adminGetDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload.stats;
        state.orderChart = action.payload.orderChart;
        state.error = null;
      })

      .addCase(adminGetDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload || "Couldn't fetch dashboard data";
      })
      /* ======================================================
         PENDING SELLERS
      ====================================================== */

      .addCase(fetchPendingVerifications.pending, (state) => {
        state.sellerLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingVerifications.fulfilled, (state, action) => {
        state.sellerLoading = false;
        const data = action.payload;
        state.pendingSellers = data.getAllRequest || [];
        state.totalCount = data.pendingSellerCount || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
        state.resultPerPage = data.resultPerPage || 6;
        state.error = null;
      })
      .addCase(fetchPendingVerifications.rejected, (state, action) => {
        state.sellerLoading = false;
        state.error = action.payload || "Failed to fetch pending requests";
      })

      /* ======================================================
         SELLER DETAILS
      ====================================================== */

      .addCase(fetchSellerDetails.pending, (state) => {
        state.sellerLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerDetails.fulfilled, (state, action) => {
        state.sellerLoading = false;
        state.selectedSeller = action.payload;
        state.error = null;
      })
      .addCase(fetchSellerDetails.rejected, (state, action) => {
        state.sellerLoading = false;
        state.selectedSeller = null;
        state.error = action.payload || "Failed to fetch seller details";
      })

      /* ======================================================
         APPROVE SELLER
      ====================================================== */

      .addCase(approveSeller.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(approveSeller.fulfilled, (state, action) => {
        state.actionLoading = false;
        const sellerId = action.payload;
        state.pendingSellers = state.pendingSellers.filter(
          (seller) => seller._id !== sellerId,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedSeller?._id === sellerId) {
          state.selectedSeller = null;
        }
        state.error = null;
      })
      .addCase(approveSeller.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to approve seller";
      })

      /* ======================================================
         REJECT SELLER
      ====================================================== */

      .addCase(rejectSeller.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectSeller.fulfilled, (state, action) => {
        state.actionLoading = false;
        const sellerId = action.payload;
        state.pendingSellers = state.pendingSellers.filter(
          (seller) => seller._id !== sellerId,
        );
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedSeller?._id === sellerId) {
          state.selectedSeller = null;
        }
        state.error = null;
      })
      .addCase(rejectSeller.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to reject seller";
      })

      /* ======================================================
         APPROVED SELLERS
      ====================================================== */

      .addCase(fetchApprovedSellers.pending, (state) => {
        state.sellerLoading = true;
        state.error = null;
      })
      .addCase(fetchApprovedSellers.fulfilled, (state, action) => {
        state.sellerLoading = false;
        const data = action.payload;
        state.approvedSellers = data.approvedSellers || [];
        state.totalCount = data.approvedSellerCount || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
        state.resultPerPage = data.resultPerPage || 6;
        state.error = null;
      })
      .addCase(fetchApprovedSellers.rejected, (state, action) => {
        state.sellerLoading = false;

        state.error = action.payload || "Failed to fetch approved sellers";
      })

      /* ======================================================
         GET ALL PRODUCTS
      ====================================================== */

      .addCase(adminGetProducts.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(adminGetProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        const data = action.payload;
        state.products = data.products || [];
        state.totalCount = data.productCount || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
        state.resultPerPage = data.resultPerPage || 6;
        state.error = null;
      })
      .addCase(adminGetProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      /* ======================================================
         GET PRODUCT DETAILS
      ====================================================== */

      .addCase(adminGetProductDetail.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(adminGetProductDetail.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.selectedProduct = action.payload.product || null;
        state.error = null;
      })
      .addCase(adminGetProductDetail.rejected, (state, action) => {
        state.productsLoading = false;
        state.selectedProduct = null;
        state.error = action.payload || "Failed to fetch product";
      })

      /* ======================================================
         UPDATE PRODUCT STATUS
      ====================================================== */

      .addCase(adminUpdateProductStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateProductStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedProduct = action.payload.product;
        if (updatedProduct) {
          /*
           * Update currently selected product.
           */
          state.selectedProduct = updatedProduct;

          /*
           * Update product inside
           * current product list.
           */
          const index = state.products.findIndex(
            (product) => product._id === updatedProduct._id,
          );

          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        }
        state.error = null;
      })

      .addCase(adminUpdateProductStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to update product status";
      })

      /* ======================================================
         DELETE PRODUCT
      ====================================================== */

      .addCase(adminDeleteProduct.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminDeleteProduct.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedProduct = action.payload.deletedProduct;
        if (deletedProduct?._id) {
          /*
           * Remove deleted product from
           * current admin product list.
           */
          state.products = state.products.filter(
            (product) => product._id !== deletedProduct._id,
          );

          /*
           * Clear selected product if
           * currently viewing deleted product.
           */
          if (state.selectedProduct?._id === deletedProduct._id) {
            state.selectedProduct = null;
          }

          /*
           * Keep count synchronized.
           */
          state.totalCount = Math.max(0, state.totalCount - 1);
        }
        state.error = null;
      })
      .addCase(adminDeleteProduct.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to delete product";
      })

      //User

      .addCase(adminGetUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(adminGetUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        const data = action.payload;
        state.users = data.users || [];
        state.totalCount = data.userCount || 0;
        state.totalPages = data.totalPages || 0;
        state.currentPage = data.currentPage || 1;
        state.resultPerPage = data.resultPerPage || 6;
        state.error = null;
      })
      .addCase(adminGetUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload || "Failed to fetch users";
      })

      //user details

      .addCase(adminGetUserDetail.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(adminGetUserDetail.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.selectedUser = action.payload.user || null;
        state.error = null;
      })
      .addCase(adminGetUserDetail.rejected, (state, action) => {
        state.usersLoading = false;
        state.selectedUser = null;
        state.error = action.payload || "Failed to fetch user";
      })

      // user's role update

      .addCase(adminUpdateUserRole.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserRole.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = action.payload.user || null;
        state.error = null;
      })
      .addCase(adminUpdateUserRole.rejected, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = null;
        state.error = action.payload || "Failed to update user role";
      })

      // user status update
      .addCase(adminUpdateUserStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updateUser = action.payload.user;
        if (updateUser) {
          /*
           * Update currently selected user.
           */
          state.selectedUser = updateUser;

          /*
           * Update product inside
           * current product list.
           */
          const index = state.users.findIndex(
            (user) => user._id === updateUser._id,
          );

          if (index !== -1) {
            state.users[index] = updateUser;
          }
        }
        state.error = null;
      })
      .addCase(adminUpdateUserStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to update user status";
      })

      // user delete
      .addCase(adminDeleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedUser = action.payload.user;
        if (deletedUser?._id) {
          /*
           * Remove deleted user from
           * current admin user list.
           */
          state.users = state.users.filter(
            (user) => user._id !== deletedUser._id,
          );

          /*
           * Clear selected user if
           * currently viewing user product.
           */
          if (state.selectedUser?._id === deletedUser._id) {
            state.selectedUser = null;
          }

          /*
           * Keep count synchronized.
           */
          state.totalCount = Math.max(0, state.totalCount - 1);
        }
        state.error = null;
      })
      .addCase(adminDeleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to delete user";
      })

      .addCase(adminGetAllOrders.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(adminGetAllOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders;
        state.orderCount = action.payload.orderCount;
        state.resultPerPage = action.payload.resultPerPage;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(adminGetAllOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload || "Couldn't fetch orders";
      })

      .addCase(adminGetSingleOrder.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(adminGetSingleOrder.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.selectedOrder = action.payload.order;
      })
      .addCase(adminGetSingleOrder.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload || "Couldn't fetch order";
      })

      .addCase(adminUpdateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updatedOrder = action.payload.order;
        // Update selected order
        state.selectedOrder = updatedOrder;

        // Update order in orders list
        const index = state.orders.findIndex(
          (order) => order._id === updatedOrder._id,
        );

        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Couldn't update order status";
      })

      .addCase(adminGetAllReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(adminGetAllReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews;
        state.reviewCount = action.payload.reviewCount;
      })
      .addCase(adminGetAllReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload || "Couldn't fetch reviews";
      })

      .addCase(adminGetProductReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(adminGetProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.selectedProductReviews = action.payload.reviews;
      })
      .addCase(adminGetProductReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload || "Couldn't fetch product reviews";
      })

      .addCase(adminDeleteReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(adminDeleteReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedReviewId = action.meta.arg.reviewId;
        const deletedProduct = action.payload.product;
        // Check whether the deleted review existed in the global reviews list
        const existedInGlobalReviews = state.reviews.some(
          (review) => review._id === deletedReviewId,
        );

        state.reviews = state.reviews.filter(
          (review) => review._id !== deletedReviewId,
        );
        state.selectedProductReviews = state.selectedProductReviews.filter(
          (review) => review._id !== deletedReviewId,
        );
        // Only decrease global count if the review was actually in that list
        if (existedInGlobalReviews) {
          state.reviewCount = Math.max(0, state.reviewCount - 1);
        }
        // Keep selected product information updated
        if (
          state.selectedProduct &&
          state.selectedProduct._id === deletedProduct._id
        ) {
          state.selectedProduct = deletedProduct;
        }
      })
      .addCase(adminDeleteReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Couldn't delete review";
      });
  },
});

export const {
  clearSelectedSeller,
  clearSelectedProduct,
  clearAdminError,
  clearSelectedUser,
  removeErrors,
  clearSelectedOrder,
  clearSelectedProductReviews,
} = adminSlice.actions;

export default adminSlice.reducer;
