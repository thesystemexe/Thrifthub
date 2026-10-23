import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  register,
  login,
  getMe,
  logout,
  sendVerifyOtp,
  verifyEmail,
  resetPassword,
  verifyResetOtp,
  SendResetOtp,
} from "./authApi";

const initialState = {
  user: null,

  isInitialized: false,

  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",

  resetPassword: {
    otpVerified: false,
    isLoading: false,
    isError: false,
    message: "",
  },
};

export const userRegister = createAsyncThunk(
  `auth/register`,
  async (userData, thunkAPI) => {
    try {
      const response = await register(userData);
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

export const userLogin = createAsyncThunk(
  `auth/login`,
  async (userData, thunkAPI) => {
    try {
      const response = await login(userData);
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

export const userLogout = createAsyncThunk(`auth/logout`, async (_thunkAPI) => {
  await logout();
});

export const userGetMe = createAsyncThunk(
  `auth/user-data`,
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

export const userSendVerifyOtp = createAsyncThunk(
  `auth/send-verify-otp`,
  async (_, thunkAPI) => {
    try {
      const response = await sendVerifyOtp();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userVerifyEmail = createAsyncThunk(
  `auth/verify-email`,
  async (otp, thunkAPI) => {
    try {
      return await verifyEmail(otp);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userSendResetOtp = createAsyncThunk(
  `auth/send-reset-otp`,
  async (email, thunkAPI) => {
    try {
      return await SendResetOtp(email);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userVerifyResetOtp = createAsyncThunk(
  `auth/verify-reset-otp`,
  async ({ email, otp }, thunkAPI) => {
    try {
      return await verifyResetOtp({ email, otp });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const userResetPassword = createAsyncThunk(
  `auth/reset-password`,
  async ({ email, otp, newPassword }, thunkAPI) => {
    try {
      const response = await resetPassword({ email, otp, newPassword });
      return response;
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

    resetPasswordState: (state) => {
      state.resetPassword = {
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: "",
        otpVerified: false,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(userRegister.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.isError = true;
        state.isLoading = false;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(userLogout.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(userGetMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userGetMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isInitialized = true;
        state.user = action.payload.user;
      })
      .addCase(userGetMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
      })
      .addCase(userSendVerifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userSendVerifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload?.message || action.payload;
      })
      .addCase(userSendVerifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
      })
      .addCase(userVerifyEmail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(userVerifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message = action.payload.message || action.payload;

        if (state.user) {
          state.user.isAccountVerified = true;
        }
      })
      .addCase(userVerifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(userSendResetOtp.pending, (state) => {
        state.resetPassword.isLoading = true;
      })
      .addCase(userSendResetOtp.fulfilled, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = false;
        state.resetPassword.message = action.payload?.message || action.payload;
      })
      .addCase(userSendResetOtp.rejected, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = true;
        state.resetPassword.message = action.payload?.message || action.payload;
      })
      .addCase(userVerifyResetOtp.pending, (state) => {
        state.resetPassword.isLoading = true;
      })
      .addCase(userVerifyResetOtp.fulfilled, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = false;
        state.resetPassword.otpVerified = true;
        state.resetPassword.message = action.payload?.message || action.payload;
      })
      .addCase(userVerifyResetOtp.rejected, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = true;
        state.resetPassword.message = action.payload?.message || action.payload;
      })
      .addCase(userResetPassword.pending, (state) => {
        state.resetPassword.isLoading = true;
      })
      .addCase(userResetPassword.fulfilled, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = false;
        state.resetPassword.message = action.payload?.message || action.payload;
      })
      .addCase(userResetPassword.rejected, (state, action) => {
        state.resetPassword.isLoading = false;
        state.resetPassword.isError = true;
        state.resetPassword.message = action.payload?.message || action.payload;
      });
  },
});

export const { reset, resetPasswordState } = authSlice.actions;

export default authSlice.reducer;
