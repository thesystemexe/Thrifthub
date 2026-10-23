const productModel = require("../models/product.model");
const sellerRequestModel = require("../models/seller.model");
const userModel = require("../models/user.model");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");
const APIFunctionality = require("../utils/apiFunctionality");
const orderModel = require("../models/order.model");
const {
  createAndSendNotification,
} = require("../services/notification.service");
/**
 * @route   GET /api/admin/seller-verification-pending
 * @desc    Fetch all pending seller verification requests
 * @access  Private (Admin)
 */

const adminVerifyController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 6;

  const apiFeatures = new APIFunctionality(
    sellerRequestModel
      .find({
        status: "pending",
      })
      .populate("user", "username"),
    req.query,
  ).search(["storeName", "ownerName"]);

  const filteredQuery = apiFeatures.query.clone();
  const pendingSellerCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(pendingSellerCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && pendingSellerCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  apiFeatures.pagination(resultPerPage);

  const getAllRequest = await apiFeatures.query.sort({
    createdAt: -1,
  });

  return resp.status(200).json({
    success: true,
    message: "Pending seller applications fetched successfully",
    getAllRequest,
    pendingSellerCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

/**
 * @route   GET /api/admin/seller/:sellerId
 * @desc    Fetch details of a specific seller request by ID
 * @access  Private (Admin)
 */
const adminViewSellerDetailsController = handleAsyncError(
  async (req, resp, next) => {
    const { sellerId } = req.params;

    const seller = await sellerRequestModel.findById(sellerId);
    if (!seller) {
      return next(new HandleError("Seller request not found", 404));
    }

    return resp.status(200).json({
      success: true,
      message: "Seller found with the provided ID",
      seller,
    });
  },
);

/**
 * @route   PATCH /api/admin/seller/:sellerId/approve
 * @desc    Approve a seller request and assign seller role to the user
 * @access  Private (Admin)
 */

const approveSellerController = handleAsyncError(async (req, resp, next) => {
  const { sellerId } = req.params;

  const seller = await sellerRequestModel.findById(sellerId);

  if (!seller) {
    return next(new HandleError("Seller request not found", 404));
  }

  // Do not send duplicate notifications for an unchanged status.
  if (seller.status === "approved") {
    return resp.status(200).json({
      success: true,
      message: "Seller is already approved",
    });
  }

  seller.status = "approved";
  seller.reviewedAt = new Date();
  seller.reviewedBy = req.user ? req.user.id || req.user._id : null;

  await seller.save();

  await userModel.findByIdAndUpdate(
    seller.user,
    { $addToSet: { roles: "seller" } },
    { new: true },
  );

  // Persist and send the notification after the status updates.
  await createAndSendNotification(req.app.get("io"), {
    userId: seller.user,
    type: "seller_approved",
    title: "Seller application approved",
    message: `Congratulations! Your application for "${seller.storeName}" has been approved. You can now access your Seller Dashboard.`,
    link: "/seller/dashboard",
  });

  return resp.status(200).json({
    success: true,
    message: "Seller approved successfully",
  });
});

/**
 * @route   PATCH /api/admin/seller/:sellerId/reject
 * @desc    Reject a seller verification request with a reason
 * @access  Private (Admin)
 */

const rejectSellerController = handleAsyncError(async (req, resp, next) => {
  const { sellerId } = req.params;
  const { rejection } = req.body;

  const seller = await sellerRequestModel.findById(sellerId);

  if (!seller) {
    return next(new HandleError("Seller request not found", 404));
  }

  if (seller.status === "rejected") {
    return resp.status(200).json({
      success: true,
      message: "Seller request is already rejected",
    });
  }

  seller.status = "rejected";
  seller.rejectionReason = rejection;
  seller.reviewedAt = new Date();
  seller.reviewedBy = req.user ? req.user.id || req.user._id : null;

  await seller.save();

  await createAndSendNotification(req.app.get("io"), {
    userId: seller.user,
    type: "seller_rejected",
    title: "Seller application update",
    message: rejection
      ? `Your application for "${seller.storeName}" was not approved. Reason: ${rejection}`
      : `Your application for "${seller.storeName}" was not approved. Please review your application and contact support if you need assistance.`,
    link: "/",
  });

  return resp.status(200).json({
    success: true,
    message: "Seller request has been rejected",
  });
});

/**
 * @route   GET /api/admin/products
 * @desc    Fetch all products for administration
 * @access  Private (Admin)
 */
const adminGetAllProductsController = handleAsyncError(
  async (req, resp, next) => {
    const resultPerPage = 6;

    const apiFeatures = new APIFunctionality(
      productModel.find(),
      req.query,
    ).search();

    const filteredQuery = apiFeatures.query.clone();
    const productCount = await filteredQuery.countDocuments();
    const totalPages = Math.ceil(productCount / resultPerPage);
    const page = Number(req.query.page) || 1;

    if (page > totalPages && productCount > 0) {
      return next(new HandleError("This page doesn't exist", 404));
    }

    apiFeatures.pagination(resultPerPage);

    const products = await apiFeatures.query.sort({
      createdAt: -1,
    });

    return resp.status(200).json({
      success: true,
      message: "All products fetched successfully",
      products,
      productCount,
      resultPerPage,
      totalPages,
      currentPage: page,
    });
  },
);

/**
 * @route   GET /api/admin/product/productId
 * @desc    Get product details for administration
 * @access  Private (Admin)
 */
const adminGetProductDetailsController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    return resp.status(200).json({
      success: true,
      product,
    });
  },
);

/**
 * @route   PATCH /api/admin/product/productId
 * @desc    update product status
 * @access  Private (Admin)
 */

const adminUpdateProductStatusController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["active", "disabled"];

    if (!status) {
      return next(new HandleError("Product status is required", 400));
    }

    if (!allowedStatuses.includes(status)) {
      return next(
        new HandleError(
          `Invalid product status. Allowed values: ${allowedStatuses.join(", ")}`,
          400,
        ),
      );
    }
    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    const statusUpdatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { status },
      { new: true, runValidators: true },
    );

    return resp.status(200).json({
      success: true,
      message: `Product ${status === "active" ? "activated" : "disabled"} successfully`,
      product: statusUpdatedProduct,
    });
  },
);

/**
 * @route DELETE /api/admin/product/:productId
 *  @desc Delete product
 *  @access Private (Admin)
 */

const adminDeleteProductController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;

    const product = await productModel.findOne({
      _id: productId,
    });

    if (!product) {
      return next(
        new HandleError(
          "Product not found or you are not authorized to edit it",
          404,
        ),
      );
    }

    const deletedProduct = await productModel.findByIdAndDelete(productId);

    if (product.images?.length) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    return resp.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct,
    });
  },
);

/**
 * @route   GET /api/admin/users
 * @desc    Fetch a list of all registered users
 * @access  Private (Admin)
 */
const adminGetUsersListController = handleAsyncError(
  async (req, resp, next) => {
    const resultPerPage = 6;

    const apiFeatures = new APIFunctionality(
      userModel.find(),
      req.query,
    ).search(["username", "email"]);

    const filteredQuery = apiFeatures.query.clone();
    const userCount = await filteredQuery.countDocuments();
    const totalPages = Math.ceil(userCount / resultPerPage);
    const page = Number(req.query.page) || 1;

    if (page > totalPages && userCount > 0) {
      return next(new HandleError("This page doesn't exist", 404));
    }

    apiFeatures.pagination(resultPerPage);

    const users = await apiFeatures.query.sort({
      createdAt: -1,
    });

    return resp.status(200).json({
      success: true,
      message: "All users fetched successfully",
      users,
      userCount,
      resultPerPage,
      totalPages,
      currentPage: page,
    });
  },
);

/**
 * @route   GET /api/admin/user/:userId
 * @desc    Fetch a single user's profile details by ID
 * @access  Private (Admin)
 */
const adminGetSingleUserController = handleAsyncError(
  async (req, resp, next) => {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(
        new HandleError(`User doesn't exist with ID: ${userId}`, 404),
      );
    }

    return resp.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  },
);

/**
 * @route   PUT /api/admin/user/:userId
 * @desc    Update roles for a specific user
 * @access  Private (Admin)
 */
const adminUpdateUserRoleController = handleAsyncError(
  async (req, resp, next) => {
    const { userId } = req.params;
    console.log(req.body);
    const { roles } = req.body;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { roles },
      { returnDocument: "after", runValidators: true },
    );

    if (!user) {
      return next(
        new HandleError(`User doesn't exist with ID: ${userId}`, 404),
      );
    }

    return resp.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  },
);

/**
 * @route   PATCH /api/admin/user/:userId/status
 * @desc    Update status for a specific user
 * @access  Private (Admin)
 */

const adminUpdateUserStatusController = handleAsyncError(
  async (req, resp, next) => {
    const { userId } = req.params;
    const { accountStatus } = req.body;

    const allowedStatuses = ["active", "disabled"];

    if (!accountStatus) {
      return next(new HandleError("Account status is required", 400));
    }

    if (!allowedStatuses.includes(accountStatus)) {
      return next(
        new HandleError(
          `Invalid account status. Allowed values: ${allowedStatuses.join(", ")}`,
          400,
        ),
      );
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return next(
        new HandleError(`User doesn't exist with ID: ${userId}`, 404),
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { accountStatus },
      {
        new: true,
        runValidators: true,
      },
    );

    return resp.status(200).json({
      success: true,
      message: `User account ${
        accountStatus === "active" ? "activated" : "disabled"
      } successfully`,
      user: updatedUser,
    });
  },
);

/**
 * @route   DELETE /api/admin/user/:userId
 * @desc    Delete a user profile from the database
 * @access  Private (Admin)
 */
const adminDeleteUserProfileController = handleAsyncError(
  async (req, resp, next) => {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(
        new HandleError(`User doesn't exist with ID: ${userId}`, 404),
      );
    }

    await userModel.findByIdAndDelete(userId);

    return resp.status(200).json({
      success: true,
      message: "User has been deleted successfully",
      user,
    });
  },
);

/**
 * @route   DELETE /api/admin/sellers
 * @desc   get a list of approved sellers
 * @access  Private (Admin)
 */

const adminGetSellersController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 6;

  const apiFeatures = new APIFunctionality(
    sellerRequestModel.find({
      status: "approved",
    }),
    req.query,
  ).search(["storeName", "ownerName"]);

  const filteredQuery = apiFeatures.query.clone();
  const approvedSellerCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(approvedSellerCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  apiFeatures.pagination(resultPerPage);

  const approvedSellers = await apiFeatures.query.sort({
    createdAt: -1,
  });

  return resp.status(200).json({
    success: true,
    message: "Approved seller applications fetched successfully",
    approvedSellers,
    approvedSellerCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/admin/orders
 * @access  Admin
 */

const getAllOrdersController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 10;
  const apiFeatures = new APIFunctionality(
    orderModel
      .find()
      .populate("user", "username email")
      .populate("orderItems.product", "name price images")
      .populate("orderItems.seller", "storeName phone"),
    req.query,
  )
    .search()
    .filter();

  const filteredQuery = apiFeatures.query.clone();
  const orderCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(orderCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && orderCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  apiFeatures.pagination(resultPerPage);

  const orders = await apiFeatures.query.sort({ createdAt: -1 }).lean();

  return resp.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    orders,
    orderCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/admin/order/:orderId
 * @access  Admin
 */

const getAdminOrderController = handleAsyncError(async (req, resp, next) => {
  const { orderId } = req.params;

  const order = await orderModel
    .findById(orderId)
    .populate("user", "username email")
    .populate("orderItems.product", "name price images")
    .populate("orderItems.seller", "storeName phone");

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  return resp.status(200).json({
    success: true,
    message: "Order fetched successfully",
    order,
  });
});

/**
 * @desc    Mark a specific order item as delivered
 * @route   PATCH /api/admin/order/:orderId/item/:itemId/status
 * @access  Admin
 */
const adminUpdateOrderItemStatusController = handleAsyncError(
  async (req, resp, next) => {
    const { orderId, itemId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return next(new HandleError("Order status is required", 400));
    }

    // Admin can only mark shipped items as delivered
    if (orderStatus !== "delivered") {
      return next(
        new HandleError(
          "Admin can only update an order item to delivered status",
          400,
        ),
      );
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return next(new HandleError("Order not found", 404));
    }

    const orderItem = order.orderItems.id(itemId);

    if (!orderItem) {
      return next(new HandleError("Order item not found", 404));
    }

    // Seller must ship the item first
    if (orderItem.orderStatus !== "shipped") {
      return next(
        new HandleError(
          `Order item cannot be marked as delivered from ${orderItem.orderStatus} status`,
          400,
        ),
      );
    }

    orderItem.orderStatus = "delivered";
    orderItem.deliveredAt = new Date();

    await order.save();

    return resp.status(200).json({
      success: true,
      message: "Order item marked as delivered successfully",
      order,
    });
  },
);

/**
 * @route   GET /api/admin/dashboard
 * @description Get admin dashboard statistics
 * @access  Admin
 */

const getAdminDashboardController = handleAsyncError(
  async (req, resp, next) => {
    const [
      totalUsers,
      totalProducts,
      pendingSellers,
      approvedSellers,
      totalOrders,
      totalReviews,
      orderChartData,
    ] = await Promise.all([
      userModel.countDocuments(),

      productModel.countDocuments(),

      sellerRequestModel.countDocuments({
        status: "pending",
      }),

      sellerRequestModel.countDocuments({
        status: "approved",
      }),

      orderModel.countDocuments(),

      productModel.aggregate([
        {
          $project: {
            reviewCount: {
              $size: {
                $ifNull: ["$reviews", []],
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: {
              $sum: "$reviewCount",
            },
          },
        },
      ]),

      // Last 7 days orders
      orderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },

            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    /*
     * Create all 7 days.
     * This is important because MongoDB only returns
     * dates where at least one order exists.
     */
    const orderMap = {};

    orderChartData.forEach((item) => {
      orderMap[item._id] = item.orders;
    });

    const orderChart = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);

      const dateKey = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      const dayName = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
      }).format(date);

      orderChart.push({
        name: dayName,
        orders: orderMap[dateKey] || 0,
      });
    }

    return resp.status(200).json({
      success: true,

      message: "Admin dashboard data fetched successfully",

      stats: {
        totalUsers,
        totalProducts,
        pendingSellers,
        approvedSellers,
        totalOrders,
        totalReviews: totalReviews[0]?.totalReviews || 0,
      },

      orderChart,
    });
  },
);

module.exports = {
  adminVerifyController,
  adminViewSellerDetailsController,
  approveSellerController,
  rejectSellerController,
  adminGetAllProductsController,
  adminGetProductDetailsController,
  adminUpdateProductStatusController,
  adminDeleteProductController,
  adminGetUsersListController,
  adminGetSingleUserController,
  adminUpdateUserRoleController,
  adminDeleteUserProfileController,
  adminGetSellersController,
  adminUpdateUserStatusController,
  getAllOrdersController,
  getAdminOrderController,
  adminUpdateOrderItemStatusController,
  getAdminDashboardController,
};
