import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login, logout, getMe } from "./authApi";

const initialState = {
  user: null,

  isInitialized: false,

  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const adminLogin = createAsyncThunk(
  `auth/admin/login`,
  async (adminData, thunkAPI) => {
    try {
      const response = await login(adminData);
      return response;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const adminLogout = createAsyncThunk(
  `auth/admin/logout`,
  async (_thunkAPI) => {
    await logout();
  },
);

export const adminGetMe = createAsyncThunk(
  `auth/admin/get-me`,
  async (_, thunkAPI) => {
    try {
      return await getMe();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(adminGetMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminGetMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isInitialized = true;
        state.user = action.payload.user;
      })
      .addCase(adminGetMe.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
      });
  },
});

export const { reset } = authSlice.actions;

export default authSlice.reducer;
