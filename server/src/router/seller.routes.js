const sellerRouter = require("express").Router();
const upload = require("../middlewares/file.middle");
const sellerController = require("../controllers/seller.controller");
const authMiddleware = require("../middlewares/auth.middle");
const authorize = require("../middlewares/role.authorize");

/**
 * @route POST api/seller/register
 * @description send sellerRequest form to admin
 * @access private
 */

sellerRouter.post(
  "/register",
  authMiddleware.authUser,
  authorize("user"),
  upload.fields([{ name: "documents", maxCount: 3 }]),
  sellerController.registerSellerController,
);

/**
 * @route GET api/seller/profile
 * @description search for the seller profile
 * @access private
 */

sellerRouter.get(
  "/profile",
  authMiddleware.authUser,
  authorize("user", "seller"),
  sellerController.getMeSellerProfile,
);

/**
 * @route GET api/seller/products
 * @description fetch the products by seller
 * @access private
 */

sellerRouter.get(
  "/products",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  authorize("seller"),
  sellerController.getAllProductsController,
);

/**
 * @route GET api/seller/get-single-product/:productId
 * @description fetch  a product by seller
 * @access private
 */

sellerRouter.get(
  "/get-single-product/:productId",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  authorize("seller"),
  sellerController.getSellerProductController,
);

/**
 * @route GET /api/seller/orders
 * @description Fetch all orders containing products belonging to the seller
 * @access private
 */

sellerRouter.get(
  "/orders",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  authorize("seller"),
  sellerController.getSellerAllOrdersController,
);

/**
 * @route GET /api/seller/order/:orderId
 * @description Fetch a specific order containing the seller's products
 * @access private
 */

sellerRouter.get(
  "/order/:orderId",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  authorize("seller"),
  sellerController.getSellerOrderController,
);

/**
 * @route PATCH /api/seller/order/:orderId/item/:itemId/status
 * @description Seller marks their order item as shipped
 * @access private
 */

sellerRouter.patch(
  "/order/:orderId/item/:itemId/status",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  authorize("seller"),
  sellerController.sellerUpdateOrderStatusController,
);

module.exports = sellerRouter;
