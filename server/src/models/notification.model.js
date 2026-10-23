const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // The user who owns this notification.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    // What event generated the notification.
    type: {
      type: String,
      enum: [
        "seller_approved",
        "seller_rejected",
        "new_message",
        "order_update",
      ],
      required: true,
    },

    // Short heading shown in the notification panel.
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Full notification text.
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional destination when the notification is clicked.
    link: {
      type: String,
      default: "",
    },

    // null means unread; a date means read.
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Supports fetching a user's newest unread notifications.
notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

const notificationModel =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

module.exports = notificationModel;
