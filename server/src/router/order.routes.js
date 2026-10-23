const orderRouter = require("express").Router();
const authMiddleWare = require("../middlewares/auth.middle");
const orderController = require("../controllers/order.controller");
const authorize = require("../middlewares/role.authorize");
const fitFeedbackController = require("../controllers/fitFeedback.controller");

/**
 * @route   POST /new/order
 * @desc    Create a new product order
 * @access  Private (User)
 */
orderRouter.post(
  "/new/order",
  authMiddleWare.authUser,
  orderController.createOrderController,
);

/**
 * @route POST /api/orders/:orderId/items/:itemId/fit-feedback
 * @desc    Create a new feedback for order
 * @access  Private (User)
 */
orderRouter.post(
  "/orders/:orderId/items/:itemId/fit-feedback",
  authMiddleWare.authUser,
  fitFeedbackController.submitFitFeedbackController,
);

/**
 * @route   GET /order/:orderId
 * @desc    Get details of a single order by ID
 * @access  Public
 */
orderRouter.get(
  "/order/:orderId",
  authMiddleWare.authUser,
  authorize("user"),
  orderController.getSingleOrderController,
);

/**
 * @route   GET /admin/order/:orderId
 * @desc    Get details of a single order by ID
 * @access  Private (Admin)
 */
orderRouter.get(
  "/admin/order/:orderId",
  authMiddleWare.authAdmin,
  authorize("admin"),
  orderController.getSingleOrderController,
);

/**
 * @route   GET /orders/user
 * @desc    Get all orders placed by the currently authenticated user
 * @access  Private (User)
 */
orderRouter.get(
  "/orders/user",
  authMiddleWare.authUser,
  orderController.allMyOrdersController,
);

/**
 * @route   GET /admin/orders
 * @desc    Get all orders across all users and total sales revenue
 * @access  Private (Admin)
 */
orderRouter.get(
  "/admin/orders",
  authMiddleWare.authAdmin,
  authorize("admin"),
  orderController.getAllOrdersController,
);

/**
 * @route   PUT /admin/order/:orderId
 * @desc    Update order status (e.g., Processing -> Shipped -> Delivered)
 * @access  Private (Admin)
 */
orderRouter.put(
  "/admin/order/:orderId",
  authMiddleWare.authAdmin,
  authorize("admin"),
  orderController.updateOrderStatusController,
);

/**
 * @route   DELETE /admin/order/:orderId
 * @desc    Delete a completed/delivered order
 * @access  Private (Admin)
 */
orderRouter.delete(
  "/admin/order/:orderId",
  authMiddleWare.authAdmin,
  authorize("admin"),
  orderController.deleteOrderController,
);

module.exports = orderRouter;
