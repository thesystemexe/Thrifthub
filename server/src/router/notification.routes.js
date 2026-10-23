const express = require("express");
const authMiddleware = require("../middlewares/auth.middle");

const notificationController = require("../controllers/notification.controller");

const notificationRouter = express.Router();

/**
 * @route GET	/api/notifications
 * @description Fetch the latest 50 notifications and unread count
 * @access public
 */

notificationRouter.get(
  "/",
  authMiddleware.authUser,
  notificationController.getMyNotifications,
);

/**
 * @route PATCH	/api/notifications/read-all
 * @description Mark all notifications as read
 * @access public
 */
notificationRouter.patch(
  "/read-all",
  authMiddleware.authUser,
  notificationController.markAllNotificationsRead,
);

/**
 * @routePATCH	/api/notifications/:notificationId/read
 * @description Mark one notification as read
 * @access public
 */
notificationRouter.patch(
  "/:notificationId/read",
  authMiddleware.authUser,
  notificationController.markNotificationRead,
);

module.exports = notificationRouter;
