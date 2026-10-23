const instance = require("../config/razorpay");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");
const crypto = require("crypto");
const mongoose = require("mongoose");

const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");

//  Helper: Calculate cart total from MongoDB data
const calculateCartTotal = (cartData) => {
  let itemPrice = 0;

  for (const cartItem of cartData) {
    const product = cartItem.product;
    const quantity = cartItem.quantity;

    if (!product) {
      throw new HandleError("A product in your cart no longer exists", 400);
    }

    if (!quantity || quantity < 1) {
      throw new HandleError("Invalid quantity in cart", 400);
    }

    itemPrice += product.price * quantity;
  }

  const taxPrice = itemPrice * 0.18;
  const shippingPrice = itemPrice >= 1000 ? 0 : 100;
  const totalPrice = itemPrice + taxPrice + shippingPrice;

  return {
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  };
};

// Create Razorpay Order
const processPaymentController = handleAsyncError(async (req, resp, next) => {
  const user = await userModel
    .findById(req.user.id)
    .populate("cartData.product");

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  if (!user.cartData || user.cartData.length === 0) {
    return next(new HandleError("Your cart is empty", 400));
  }

  // Validate products and stock before creating payment
  for (const cartItem of user.cartData) {
    const product = cartItem.product;

    if (!product) {
      return next(
        new HandleError("A product in your cart no longer exists", 400),
      );
    }

    if (product.status !== "active") {
      return next(
        new HandleError(`${product.title} is currently unavailable`, 400),
      );
    }

    if (product.stock < cartItem.quantity) {
      return next(
        new HandleError(
          `${product.title} does not have enough stock available`,
          400,
        ),
      );
    }
  }

  const { itemPrice, taxPrice, shippingPrice, totalPrice } = calculateCartTotal(
    user.cartData,
  );

  // Razorpay expects amount in paise
  const razorpayAmount = Math.round(totalPrice * 100);

  const options = {
    amount: razorpayAmount,
    currency: "INR",
    // Useful for verifying that this Razorpay order
    // belongs to this authenticated user.
    notes: {
      userId: req.user.id.toString(),
    },
  };

  const order = await instance.orders.create(options);

  return resp.status(200).json({
    success: true,
    order,
    pricing: {
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    },
  });
});

// Send Razorpay API Key
const sendAPIkeyController = handleAsyncError(async (req, resp, next) => {
  resp.status(200).json({
    key: process.env.RAZORPAY_API_KEY,
  });
});

// Payment verification
const paymentVerificationController = handleAsyncError(
  async (req, resp, next) => {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      shippingInfo,
    } = req.body;

    // 1. Validate required payment information

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return next(new HandleError("Payment information is incomplete", 400));
    }

    // 2. Validate shipping information

    if (
      !shippingInfo ||
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.country ||
      !shippingInfo.state ||
      !shippingInfo.phoneNo ||
      !shippingInfo.pinCode
    ) {
      return next(
        new HandleError("Complete shipping information is required", 400),
      );
    }

    // 3. Verify Razorpay signature

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isAuthentic) {
      return next(new HandleError("Payment verification failed", 400));
    }

    // 4. Fetch Razorpay order

    const razorpayOrder = await instance.orders.fetch(razorpay_order_id);

    if (!razorpayOrder) {
      return next(new HandleError("Razorpay order not found", 404));
    }

    // 5. Make sure Razorpay order belongs to logged-in user

    if (razorpayOrder.notes?.userId !== req.user.id.toString()) {
      return next(
        new HandleError("This payment does not belong to this user", 403),
      );
    }

    // 6. Fetch Razorpay payment

    const razorpayPayment = await instance.payments.fetch(razorpay_payment_id);

    if (!razorpayPayment) {
      return next(new HandleError("Razorpay payment not found", 404));
    }

    // 7. Make sure payment belongs to this Razorpay order

    if (razorpayPayment.order_id !== razorpay_order_id) {
      return next(
        new HandleError("Payment does not belong to this Razorpay order", 400),
      );
    }

    // 8. Payment must be captured

    if (razorpayPayment.status !== "captured") {
      return next(new HandleError("Payment has not been captured", 400));
    }

    // 9. Verify paid amount

    if (razorpayPayment.amount !== razorpayOrder.amount) {
      return next(
        new HandleError("Payment amount does not match the order amount", 400),
      );
    }

    // 10. Prevent duplicate order creation

    const existingOrder = await orderModel.findOne({
      "paymentInfo.id": razorpay_payment_id,
    });

    if (existingOrder) {
      return resp.status(200).json({
        success: true,
        message: "Order already created",
        reference: razorpay_payment_id,
        order: existingOrder,
      });
    }

    // 11. Start MongoDB transaction

    const session = await mongoose.startSession();

    try {
      let createdOrder;

      await session.withTransaction(async () => {
        // Get user's current MongoDB cart
        const user = await userModel
          .findById(req.user.id)
          .populate("cartData.product")
          .session(session);

        if (!user) {
          throw new HandleError("User not found", 404);
        }

        if (!user.cartData || user.cartData.length === 0) {
          throw new HandleError("Your cart is empty", 400);
        }

        const orderItems = [];
        let itemPrice = 0;

        // 12. Check stock + atomically decrement stock

        for (const cartItem of user.cartData) {
          const product = cartItem.product;
          const quantity = cartItem.quantity;

          if (!product) {
            throw new HandleError(
              "A product in your cart no longer exists",
              400,
            );
          }

          if (!quantity || quantity < 1) {
            throw new HandleError("Invalid quantity in cart", 400);
          }

          if (product.status !== "active") {
            throw new HandleError(
              `${product.title} is no longer available`,
              400,
            );
          }

          // Atomic stock decrement
          const updatedProduct = await productModel.findOneAndUpdate(
            {
              _id: product._id,
              stock: {
                $gte: quantity,
              },
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

          // Calculate from DB product price
          itemPrice += product.price * quantity;

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

        // 13. Calculate final authoritative prices

        const taxPrice = itemPrice * 0.18;

        const shippingPrice = itemPrice >= 1000 ? 0 : 100;

        const totalPrice = itemPrice + taxPrice + shippingPrice;

        // 14. Make sure this equals Razorpay amount

        const backendAmountInPaise = Math.round(totalPrice * 100);

        if (backendAmountInPaise !== razorpayPayment.amount) {
          throw new HandleError(
            "Payment amount does not match the current cart total",
            400,
          );
        }

        // 15. Create order

        const orders = await orderModel.create(
          [
            {
              shippingInfo: {
                address: shippingInfo.address,
                city: shippingInfo.city,
                country: shippingInfo.country,
                state: shippingInfo.state,
                phoneNo: shippingInfo.phoneNo,
                pinCode: shippingInfo.pinCode,
              },

              orderItems,

              user: req.user.id,

              paymentInfo: {
                id: razorpay_payment_id,
                status: razorpayPayment.status,
              },

              paidAt: new Date(),

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

        // 16. Clear MongoDB cart

        user.cartData = [];

        await user.save({
          session,
        });
      });

      // 17. Payment + order successfully completed

      return resp.status(200).json({
        success: true,
        message: "Payment verified and order placed successfully",
        reference: razorpay_payment_id,
        order: createdOrder,
      });
    } finally {
      await session.endSession();
    }
  },
);

module.exports = {
  processPaymentController,
  sendAPIkeyController,
  paymentVerificationController,
};
