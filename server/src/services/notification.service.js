const notificationModel = require("../models/notification.model");

const createAndSendNotification = async (io, data) => {
  // Save first so an offline user can retrieve the notification later.
  const notification = await notificationModel.create({
    user: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link || "",
  });

  // Send only to the authenticated user's private room.
  if (io) {
    io.to(`user:${data.userId.toString()}`).emit(
      "notification:new",
      notification,
    );
  }

  return notification;
};

module.exports = { createAndSendNotification };
