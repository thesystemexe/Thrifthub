const sellerRequestModel = require("../models/seller.model");
const HandleError = require("../utils/handleError");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const handleAsyncError = require("../middlewares/handleAsyncError");
const productModel = require("../models/product.model");
const APIFunctionality = require("../utils/apiFunctionality");
const orderModel = require("../models/order.model");
/**
 * @route POST api/seller/register
 * @description send sellerRequest form to admin
 * @access private
 */

const registerSellerController = async (req, resp, next) => {
  const id = req.user?.id;

  try {
    if (!id) {
      return next(
        new HandleError(
          "User must be logged in as user to apply for seller",
          401,
        ),
      );
    }

    // 1. Check if user already submitted a request
    const existingRequest = await sellerRequestModel.findOne({ user: id });

    if (existingRequest) {
      return resp.status(400).json({
        message: `Seller application already exists with status: ${existingRequest.status}`,
      });
    }

    // 2. Destructure body fields matching sellerRequestSchema
    const { storeName, storeDescription, phone, street, city, state, zipCode } =
      req.body;

    // Validate required fields
    if (
      !storeName ||
      !storeDescription ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !zipCode
    ) {
      return resp.status(400).json({
        message:
          "Please fill in all required fields (storeName, storeDescription, phone, and address details).",
      });
    }

    // 3. Handle Cloudinary Document Uploads
    // Expecting req.files to be populated by multer (e.g., upload.array('documents') or upload.fields([{ name: 'documents' }]))
    const documentFiles =
      req.files?.documents || (Array.isArray(req.files) ? req.files : []);

    if (!documentFiles || documentFiles.length === 0) {
      return resp.status(400).json({
        message: "Please upload at least one verification document.",
      });
    }

    // Upload all buffers concurrently to Cloudinary using your streamifier utility
    const uploadedDocuments = await Promise.all(
      documentFiles.map(async (file) => {
        const result = await uploadToCloudinary(
          file.buffer,
          "seller-documents",
          "auto",
        );

        return {
          docType: req.body.docType || "Business_License", // Optional document category
          url: result.secure_url,
        };
      }),
    );

    // 4. Save to Database using sellerRequestModel
    const sellerRequest = await sellerRequestModel.create({
      user: id,
      storeName,
      storeDescription,
      phone,
      businessAddress: {
        street,
        city,
        state,
        zipCode,
      },
      documents: uploadedDocuments,
      status: "pending",
    });

    return resp.status(201).json({
      success: true,
      message:
        "Seller application submitted successfully. Awaiting admin approval.",
      sellerRequest,
    });
  } catch (error) {
    console.error("Seller Registration Error:", error);
    return resp.status(500).json({
      success: false,
      message: "An error occurred while submitting the seller request.",
      error: error.message,
    });
  }
};

/**
 * @route GET api/seller/profile
 * @description search for the seller profile
 * @access private
 */

const getMeSellerProfile = handleAsyncError(async (req, resp, next) => {
  if (!req.user.id) {
    return next(new HandleError("Unauthorized", 401));
  }
  const sellerProfile = await sellerRequestModel.findOne({
    user: req.user.id,
  });
  return resp
    .status(200)
    .json({ message: "Profile searched successfully", sellerProfile });
});

/**
 * @route GET api/seller/products
 * @description  fetch the products by seller
 * @access private
 */

const getAllProductsController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 6;

  const apiFeatures = new APIFunctionality(
    productModel.find({ seller: req.seller._id }),
    req.query,
  )
    .search()
    .filter();

  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();

  // Calculate the total pages based on filtered count
  const totalPages = Math.ceil(productCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new HandleError("This page doesn't exit", 404));
  }

  // Apply pagination
  apiFeatures.pagination(resultPerPage);
  const products = await apiFeatures.query;

  if (!products || products.length == 0) {
    return next(new HandleError("No product found", 404));
  }
  return resp.status(200).json({
    success: true,
    message: "Products fetched successfully",
    products,
    productCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

/**
 * @route GET api/seller/get-single-product/:productId
 * @description fetch  a product by seller
 * @access private
 */

const getSellerProductController = handleAsyncError(async (req, resp, next) => {
  const { productId } = req.params;
  const product = await productModel.findOne({
    _id: productId,
    seller: req.seller._id,
  });

  if (!product) {
    return next(
      new HandleError(
        "Product not found or you are not authorized to view it",
        404,
      ),
    );
  }

  return resp.status(200).json({
    success: true,
    message: "Product fetched successfully",
    product,
  });
});

/**
 * @route GET /api/seller/orders
 * @description Fetch all orders containing products belonging to the seller
 * @access private
 */

const getSellerAllOrdersController = handleAsyncError(
  async (req, resp, next) => {
    const resultPerPage = 6;

    const apiFeatures = new APIFunctionality(
      orderModel.find({
        "orderItems.seller": req.seller._id,
      }),
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

    // Only return this seller's order items.
    const sellerOrders = orders.map((order) => {
      const sellerOrderItems = order.orderItems.filter(
        (item) => item.seller.toString() === req.seller._id.toString(),
      );

      const sellerItemsPrice = sellerOrderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      return {
        ...order,
        orderItems: sellerOrderItems,
        itemsPrice: sellerItemsPrice,
      };
    });

    return resp.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: sellerOrders,
      orderCount,
      resultPerPage,
      totalPages,
      currentPage: page,
    });
  },
);

/**
 * @route GET /api/seller/order/:orderId
 * @description Fetch a specific order containing the seller's products
 * @access private
 */

const getSellerOrderController = handleAsyncError(async (req, resp, next) => {
  const { orderId } = req.params;

  const order = await orderModel.findOne({
    _id: orderId,
    "orderItems.seller": req.seller._id,
  });

  if (!order) {
    return next(
      new HandleError(
        "Order not found or you are not authorized to view it",
        404,
      ),
    );
  }

  // Filter to include only items belonging to this seller
  const sellerOrderItems = order.orderItems.filter(
    (item) => item.seller.toString() === req.seller._id.toString(),
  );

  // Recalculate totals specifically for this seller's items
  const sellerItemsPrice = sellerOrderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return resp.status(200).json({
    success: true,
    message: "Order fetched successfully",
    order: {
      ...order.toObject(),
      orderItems: sellerOrderItems,
      itemsPrice: sellerItemsPrice,
    },
  });
});

/**
 * @route PATCH /api/seller/order/:orderId/item/:itemId/status
 * @description Seller marks their order item as shipped
 * @access private
 */

const sellerUpdateOrderStatusController = handleAsyncError(
  async (req, resp, next) => {
    const { orderId, itemId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return next(new HandleError("Order status is required", 400));
    }

    // Seller can only mark their own item as shipped.
    if (orderStatus !== "shipped") {
      return next(
        new HandleError(
          "Seller can only update an order to shipped status",
          400,
        ),
      );
    }

    // Find the order only if this exact item belongs to this seller.
    const order = await orderModel.findOne({
      _id: orderId,
      orderItems: {
        $elemMatch: {
          _id: itemId,
          seller: req.seller._id,
        },
      },
    });

    if (!order) {
      return next(
        new HandleError(
          "Order item not found or you are not authorized to update it",
          404,
        ),
      );
    }

    // Get the exact order item.
    const orderItem = order.orderItems.id(itemId);

    if (!orderItem) {
      return next(new HandleError("Order item not found", 404));
    }

    // Seller can only move processing → shipped.
    if (orderItem.orderStatus !== "processing") {
      return next(
        new HandleError(
          `Order item cannot be marked as shipped from ${orderItem.orderStatus} status`,
          400,
        ),
      );
    }

    // Update the seller's item.
    orderItem.orderStatus = "shipped";
    orderItem.shippedAt = new Date();

    await order.save();

    // Return only this seller's order items.
    const sellerOrderItems = order.orderItems.filter(
      (item) => item.seller.toString() === req.seller._id.toString(),
    );

    const sellerOrder = {
      ...order.toObject(),
      orderItems: sellerOrderItems,
    };

    return resp.status(200).json({
      success: true,
      message: "Order item marked as shipped successfully",
      order: sellerOrder,
    });
  },
);

module.exports = {
  registerSellerController,
  getMeSellerProfile,
  getAllProductsController,
  getSellerProductController,
  getSellerAllOrdersController,
  getSellerOrderController,
  sellerUpdateOrderStatusController,
};
