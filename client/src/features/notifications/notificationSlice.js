import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationApi";

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, thunkAPI) => {
    try {
      return await getNotifications();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const readNotification = createAsyncThunk(
  "notifications/readOne",
  async (notificationId, thunkAPI) => {
    try {
      const response = await markNotificationRead(notificationId);
      return response.notification;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

export const readAllNotifications = createAsyncThunk(
  "notifications/readAll",
  async (_, thunkAPI) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const incoming = action.payload;

      // Avoid adding the same database notification twice.
      if (
        !incoming?._id ||
        state.notifications.some((item) => item._id === incoming._id)
      ) {
        return;
      }

      state.notifications.unshift(incoming);

      if (!incoming.readAt) {
        state.unreadCount += 1;
      }

      // Keep the same 50-item limit as the backend.
      state.notifications = state.notifications.slice(0, 50);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load notifications";
      })

      .addCase(readNotification.fulfilled, (state, action) => {
        const updated = action.payload;
        const existing = state.notifications.find(
          (item) => item._id === updated._id,
        );
        if (existing && !existing.readAt && updated.readAt) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.map((item) =>
          item._id === updated._id ? updated : item,
        );
      })

      .addCase(readAllNotifications.fulfilled, (state) => {
        const now = new Date().toISOString();
        state.notifications = state.notifications.map((item) => ({
          ...item,
          readAt: item.readAt || now,
        }));

        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
