const adminRouter = require("express").Router();
const authMiddleware = require("../middlewares/auth.middle");
const adminController = require("../controllers/admin.controller");
const authorize = require("../middlewares/role.authorize");
const fitDatasetController = require("../controllers/fitDataset.controller");

/**
 * @route   GET /api/admin/seller-verification-pending
 * @desc    Fetch all pending seller requests
 * @access  Private (Admin)
 */
adminRouter.get(
  "/seller-verification-pending",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminVerifyController,
);

/**
 * @route   GET /api/admin/seller/:sellerId
 * @desc    View seller details by ID
 * @access  Private (Admin)
 */
adminRouter.get(
  "/seller/:sellerId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminViewSellerDetailsController,
);

/**
 * @route   PATCH /api/admin/seller/:sellerId/approve
 * @desc    Approve pending seller request
 * @access  Private (Admin)
 */
adminRouter.patch(
  "/seller/:sellerId/approve",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.approveSellerController,
);

/**
 * @route   PATCH /api/admin/seller/:sellerId/reject
 * @desc    Reject pending seller request
 * @access  Private (Admin)
 */
adminRouter.patch(
  "/seller/:sellerId/reject",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.rejectSellerController,
);

/**
 * @route   GET /api/admin/products
 * @desc    Get all products for administration
 * @access  Private (Admin)
 */
adminRouter.get(
  "/products",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminGetAllProductsController,
);

/**
 * @route   GET /api/admin/product/productId
 * @desc    Get product details for administration
 * @access  Private (Admin)
 */
adminRouter.get(
  "/product/:productId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminGetProductDetailsController,
);

/**
 * @route   GET /api/admin/product/productId
 * @desc    update product status
 * @access  Private (Admin)
 */
adminRouter.patch(
  "/product/:productId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminUpdateProductStatusController,
);

/**
 * @route   DELETE /api/admin/product/productId
 * @desc    delete product
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/product/:productId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminDeleteProductController,
);

/**
 * @route   GET /api/admin/users
 * @desc    Get list of all users
 * @access  Private (Admin)
 */
adminRouter.get(
  "/users",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminGetUsersListController,
);

/**
 * @route   GET /api/admin/user/:userId
 * @desc    Get details of a single user
 * @access  Private (Admin)
 */
adminRouter.get(
  "/user/:userId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminGetSingleUserController,
);

/**
 * @route   PATCH /api/admin/user/:userId/status
 * @desc    update the user status
 * @access  Private (Admin)
 */

adminRouter.patch(
  "/user/:userId/status",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminUpdateUserStatusController,
);

/**
 * @route   PUT /api/admin/user/:userId
 * @desc    Update a user's role
 * @access  Private (Admin)
 */
adminRouter.put(
  "/user/:userId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminUpdateUserRoleController,
);

/**
 * @route   DELETE /api/admin/user/:userId
 * @desc    Delete a user profile
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/user/:userId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminDeleteUserProfileController,
);

/**
 * @route   DELETE /api/admin/sellers
 * @desc   get a list of approved sellers
 * @access  Private (Admin)
 */

adminRouter.get(
  "/sellers",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminGetSellersController,
);

/**
 * @desc    Get all orders
 * @route   GET /api/admin/orders
 * @access  Admin
 */

adminRouter.get(
  "/orders",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.getAllOrdersController,
);

/**
 * @desc    Get single order
 * @route   GET /api/admin/order/:orderId
 * @access  Admin
 */

adminRouter.get(
  "/order/:orderId",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.getAdminOrderController,
);

/**
 * @desc    Mark a specific order item as delivered
 * @route   PATCH /api/admin/order/:orderId/item/:itemId/status
 * @access  Admin
 */

adminRouter.patch(
  "/order/:orderId/item/:itemId/status",
  authMiddleware.authAdmin,
  authorize("admin"),
  adminController.adminUpdateOrderItemStatusController,
);

/**
 * @desc    fitData responses
 * @route   GET /api/admin/fit-feedback/dataset.csv
 * @access  Admin
 */
adminRouter.get(
  "/fit-feedback/dataset.csv",
  authMiddleware.authAdmin,
  authorize("admin"),
  fitDatasetController.exportFitDatasetController,
);

/**
 * @route   GET /api/admin/dashboard
 * @description Get admin dashboard statistics
 * @access  Admin
 */
adminRouter.get(
  "/dashboard",
  authMiddleware.authAdmin,
  adminController.getAdminDashboardController,
);

module.exports = adminRouter;
