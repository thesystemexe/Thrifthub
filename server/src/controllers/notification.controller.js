const notificationModel = require("../models/notification.model");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");

// Get the logged-in user's notifications.
const getMyNotifications = handleAsyncError(async (req, res) => {
  const userId = req.user.id;

  const [notifications, unreadCount] = await Promise.all([
    notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),

    notificationModel.countDocuments({
      user: userId,
      readAt: null,
    }),
  ]);

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
});

// Mark one of the logged-in user's notifications as read.
const markNotificationRead = handleAsyncError(async (req, res, next) => {
  const notification = await notificationModel.findOneAndUpdate(
    {
      _id: req.params.notificationId,
      user: req.user.id,
    },
    {
      $set: { readAt: new Date() },
    },
    { new: true },
  );

  if (!notification) {
    return next(new HandleError("Notification not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

// Mark every unread notification belonging to this user as read.
const markAllNotificationsRead = handleAsyncError(async (req, res) => {
  await notificationModel.updateMany(
    {
      user: req.user.id,
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    },
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
  });
});

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
