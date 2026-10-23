const productRouter = require("express").Router();
const authMiddleware = require("../middlewares/auth.middle");
const authorize = require("../middlewares/role.authorize");
const productController = require("../controllers/product.controller");
const upload = require("../middlewares/file.middle");

// ==========================================
// 1. CREATE & UPDATE PRODUCT ROUTES
// ==========================================

/**
 * @route   POST /api/product/create-product
 * @description Create a new product with image upload
 * @access  Private (User, Seller)
 */
productRouter.post(
  "/create-product",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  upload.fields([{ name: "images", maxCount: 3 }]),
  productController.uploadProductController,
);

/**
 * @route   PUT /api/product/update-product/:productId
 * @description Update an existing product by ID
 * @access  Private (User, Seller)
 */
productRouter.put(
  "/update-product/:productId",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  upload.fields([{ name: "images", maxCount: 3 }]),
  productController.updateProductController,
);

/**
 * @route   DELETE /api/product/delete-product/:productId
 * @description Delete a product by ID
 * @access  Private (User, Seller)
 */
productRouter.delete(
  "/delete-product/:productId",
  authMiddleware.authUser,
  authMiddleware.authSeller,
  productController.deleteProductController,
);

// ==========================================
// 2. STATIC/SPECIFIC ROUTES (Must go BEFORE dynamic :productId)
// ==========================================

/**
 * @route   GET /api/product/get-all-products
 * @description Fetch all available products
 * @access  Private (User, Seller)
 */
productRouter.get(
  "/get-all-products",
  authMiddleware.authUser,
  authorize("user"),
  productController.getAllProductsController,
);

/**
 * @route   GET /api/product/favorites
 * @description Get all favorites of logged-in user
 * @access  Private (User)
 */
productRouter.get(
  "/favorites",
  authMiddleware.authUser,
  productController.getMyFavoritesController,
);

/**
 * @route   DELETE /api/product/user/favorites/clear
 * @description Clear all favorites
 * @access  Private (User)
 */
productRouter.delete(
  "/user/favorites/clear",
  authMiddleware.authUser,
  authorize("user"),
  productController.clearFavoritesController,
);

/**
 * @route   PUT /api/product/review
 * @description Create a review for the product or update if it exists
 * @access  Private
 */
productRouter.put(
  "/review",
  authMiddleware.authUser,
  productController.createReviewForProductController,
);

/**
 * @route   GET /api/product/reviews
 * @description Get reviews for a specific product
 * @access  User
 */
productRouter.get(
  "/reviews",
  authMiddleware.authUser,
  productController.getProductReviewsController,
);

/**
 * @route   GET /api/product/admin/reviews
 * @description Get all product reviews for admin management
 * @access  Admin
 */
productRouter.get(
  "/admin/reviews",
  authMiddleware.authAdmin,
  productController.getAllReviewsController,
);

/**
 * @route   POST /api/product/user/addToCart",
 * @description Add to cart
 * @access  Public
 */
productRouter.post(
  "/user/addToCart",
  authMiddleware.authUser,
  productController.addToCartController,
);

/**
 * @route   GET /api/product/user/cart",
 * @description get my cart
 * @access  Public
 */
productRouter.get(
  "/user/cart",
  authMiddleware.authUser,
  productController.getMyCartController,
);

/**
 * @route   PATCH /api/product/user/cart/:productId",
 * @description update product quantity in user's cart
 * @access  Public
 */
productRouter.patch(
  "/user/cart/:productId",
  authMiddleware.authUser,
  productController.updateCartQuantityController,
);

/**
 * @route   DELETE /api/product/user/cart/:productId",
 * @description delete product quantity in user's cart
 * @access  Public
 */
productRouter.delete(
  "/user/cart/:productId",
  authMiddleware.authUser,
  productController.removeFromCartController,
);

/**
 * @route   DELETE /api/product/user/cart",
 * @description clear my cart
 * @access  Public
 */
productRouter.delete(
  "/user/cart",
  authMiddleware.authUser,
  productController.clearCartController,
);

/**
 * @route   POST /api/product/:productId/size-recommendation
 * @description Estimate garment fit from buyer measurements
 * @access  Authenticated user or seller
 */
productRouter.post(
  "/:productId/size-recommendation",
  authMiddleware.authUser,
  authorize("user", "seller"),
  productController.getSizeRecommendationController,
);

// ==========================================
// 3. DYNAMIC PARAMS & FAVORITE TOGGLE ROUTES
// ==========================================

/**
 * @route   PATCH /api/product/favorite/:productId
 * @description Add/remove favorite
 * @access  Private (User)
 */
productRouter.patch(
  "/favorite/:productId",
  authMiddleware.authUser,
  authorize("user"),
  productController.toggleFavoriteController,
);

/**
 * @route   GET /api/product/:productId/reviews
 * @description Getting reviews for a specific product
 * @access  Admin
 */
productRouter.get(
  "/:productId/reviews",
  authMiddleware.authAdmin,
  productController.getAdminProductReviewsController,
);

/**
 * @route   DELETE /api/product/:productId/admin/review/:reviewId
 * @description Delete a specific product review and update product rating
 * @access  Admin
 */
productRouter.delete(
  "/:productId/admin/review/:reviewId",
  authMiddleware.authAdmin,
  productController.adminDeleteReviewController,
);

/**
 * @route   GET /api/product/:productId
 * @description Fetch a single product by ID (Placed at the bottom to avoid capturing static routes)
 * @access  Private (User, Seller)
 */
productRouter.get(
  "/:productId",
  authMiddleware.authUser,
  authorize("user", "seller"),
  productController.getASingleProductController,
);

module.exports = productRouter;
