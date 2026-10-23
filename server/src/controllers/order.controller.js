const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const userModel = require("../models/user.model");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");
const { default: mongoose } = require("mongoose");

/**
 * @route   POST api/new/order
 * @desc    Create a new product order
 * @access  Private (Authenticated User)
 */
const createOrderController = handleAsyncError(async (req, resp, next) => {
  const { shippingInfo, paymentInfo } = req.body;

  const userId = req.user.id;

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      // ==========================================
      // 1. GET USER CART
      // ==========================================

      const user = await userModel
        .findById(userId)
        .populate("cartData.product")
        .session(session);

      if (!user) {
        throw new HandleError("User not found", 404);
      }

      if (!user.cartData || user.cartData.length === 0) {
        throw new HandleError("Your cart is empty", 400);
      }

      // ==========================================
      // 2. PREPARE ORDER ITEMS + CALCULATE PRICE
      // ==========================================

      const orderItems = [];

      let itemPrice = 0;

      // ==========================================
      // 3. CHECK STOCK + DECREASE STOCK
      // ==========================================

      for (const cartItem of user.cartData) {
        const product = cartItem.product;
        const quantity = cartItem.quantity;

        if (!product) {
          throw new HandleError("A product in your cart no longer exists", 400);
        }

        if (!quantity || quantity < 1) {
          throw new HandleError("Invalid quantity in cart", 400);
        }

        // Atomically decrease stock ONLY
        // if enough stock exists.
        const updatedProduct = await productModel.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity },
          },
          {
            $inc: {
              stock: -quantity,
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedProduct) {
          throw new HandleError(
            `${product.title} does not have enough stock available`,
            400,
          );
        }

        // ==========================================
        // 4. CALCULATE ITEM PRICE FROM DATABASE
        // ==========================================

        itemPrice += product.price * quantity;

        // ==========================================
        // 5. CREATE ORDER ITEM
        // ==========================================

        orderItems.push({
          name: product.title,
          price: product.price,
          quantity,
          image: product.images?.[0]?.url || "",
          product: product._id,
          seller: product.seller,

          orderStatus: "processing",

          shippedAt: null,
          deliveredAt: null,
        });
      }

      // ==========================================
      // 6. CALCULATE TAX + SHIPPING
      // ==========================================

      // Example tax calculation
      const taxPrice = itemPrice * 0.18;

      // Example shipping calculation
      const shippingPrice = itemPrice >= 1000 ? 0 : 100;

      // Final amount calculated by backend
      const totalPrice = itemPrice + taxPrice + shippingPrice;

      // ==========================================
      // 7. CREATE ORDER
      // ==========================================

      const orders = await orderModel.create(
        [
          {
            shippingInfo,

            orderItems,

            user: userId,

            paymentInfo,

            paidAt: new Date(),

            // Backend-calculated values
            itemPrice,
            taxPrice,
            shippingPrice,
            totalPrice,

            createdAt: new Date(),
          },
        ],
        {
          session,
        },
      );

      createdOrder = orders[0];

      // ==========================================
      // 8. CLEAR USER CART
      // ==========================================

      user.cartData = [];

      await user.save({
        session,
      });
    });

    // ==========================================
    // 9. TRANSACTION SUCCESS
    // ==========================================

    return resp.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
});

/**
 * @route   GET api/admin/order/:orderId
 * @desc    Get details of a single order by ID
 * @access  Private (Admin Only)
 */
const getSingleOrderController = handleAsyncError(async (req, resp, next) => {
  const order = await orderModel
    .findById(req.params.orderId)
    .populate("user", "username email");

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  return resp.status(200).json({
    success: true,
    order,
  });
});

/**
 * @route   GET api/orders/user
 * @desc    Get all orders belonging to the logged-in user
 * @access  Private (Authenticated User)
 */
const allMyOrdersController = handleAsyncError(async (req, resp, next) => {
  const orders = await orderModel.find({ user: req.user.id });

  if (!orders) {
    return next(new HandleError("No Orders found", 404));
  }

  return resp.status(200).json({
    success: true,
    orders,
  });
});

/**
 * @route   GET api/admin/orders
 * @desc    Get all orders across all users and total order amount
 * @access  Private (Admin Only)
 */
const getAllOrdersController = handleAsyncError(async (req, resp, next) => {
  const orders = await orderModel.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  return resp.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
});

/**
 * @route   PUT api/admin/order/:orderId
 * @desc    Update order status and deduct product stock on delivery
 * @access  Private (Admin Only)
 */
const updateOrderStatusController = handleAsyncError(
  async (req, resp, next) => {
    const order = await orderModel.findById(req.params.orderId);
    if (!order) {
      return next(new HandleError("No order found", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new HandleError("This order has already been delivered", 400),
      );
    }

    if (req.body.status === "Delivered") {
      await Promise.all(
        order.orderItems.map((item) =>
          updateQuantity(item.product, item.quantity),
        ),
      );
    }

    order.orderStatus = req.body.status;

    if (order.orderStatus === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    return resp.status(200).json({
      success: true,
      order,
    });
  },
);

/**
 * @route   DELETE api/admin/order/:orderId
 * @desc    Delete a delivered order
 * @access  Private (Admin Only)
 */
const deleteOrderController = handleAsyncError(async (req, resp, next) => {
  const order = await orderModel.findById(req.params.orderId);
  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  if (order.orderStatus !== "Delivered") {
    return next(
      new HandleError(
        "This order is under processing and cannot be deleted",
        400,
      ),
    );
  }
  await order.deleteOne({ _id: req.params.orderId });
  return resp.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

/**
 * @helper  Internal function to reduce product stock quantity
 * @param   {String} id - Product ObjectId
 * @param   {Number} quantity - Quantity to deduct
 */
async function updateQuantity(id, quantity) {
  const product = await productModel.findById(id);

  if (!product) {
    throw new HandleError("Product not found", 404);
  }
  product.stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

module.exports = {
  createOrderController,
  getSingleOrderController,
  allMyOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  deleteOrderController,
};
