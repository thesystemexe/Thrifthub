const mongoose = require("mongoose");
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const fitFeedbackModel = require("../models/fitFeedback.model");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");

const submitFitFeedbackController = handleAsyncError(async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const {
    fitOutcome,
    chest,
    shoulderWidth,
    height,
    preferredFit,
    consentToUseForTraining = false,
  } = req.body;

  if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(itemId)) {
    return next(new HandleError("Invalid order or item ID", 400));
  }

  const allowedOutcomes = ["too_tight", "fits_well", "too_loose"];

  if (!allowedOutcomes.includes(fitOutcome)) {
    return next(new HandleError("Invalid fit outcome", 400));
  }

  if (typeof consentToUseForTraining !== "boolean") {
    return next(new HandleError("Training consent must be true or false", 400));
  }

  if (
    preferredFit !== undefined &&
    !["slim", "regular", "relaxed"].includes(preferredFit)
  ) {
    return next(new HandleError("Invalid preferred fit", 400));
  }

  // Validate optional body measurements when supplied.
  const bodyMeasurements = {};

  for (const [field, value, max] of [
    ["chest", chest, 100],
    ["shoulderWidth", shoulderWidth, 40],
    ["height", height, 100],
  ]) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0 || number > max) {
      return next(
        new HandleError(`Invalid ${field} measurement in inches`, 400),
      );
    }

    bodyMeasurements[field] = number;
  }

  bodyMeasurements.unit = "in";

  // Only the buyer who owns this order may submit feedback.
  const order = await orderModel.findOne({
    _id: orderId,
    user: req.user.id,
  });

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  const orderItem = order.orderItems.id(itemId);

  if (!orderItem) {
    return next(new HandleError("Order item not found", 404));
  }

  if (orderItem.orderStatus !== "delivered" || !orderItem.deliveredAt) {
    return next(
      new HandleError(
        "Fit feedback is available after the item is delivered",
        400,
      ),
    );
  }

  // Check for existing feedback before creating a new record.
  const existingFeedback = await fitFeedbackModel.findOne({
    user: req.user.id,
    order: order._id,
    orderItemId: orderItem._id,
  });

  if (existingFeedback) {
    return next(
      new HandleError("Feedback has already been submitted for this item", 409),
    );
  }

  const product = await productModel.findById(orderItem.product);

  if (!product) {
    return next(
      new HandleError(
        "The product is no longer available for feedback processing",
        404,
      ),
    );
  }

  const measurements = product.sizing?.measurements;

  const feedback = await fitFeedbackModel.create({
    user: req.user.id,
    order: order._id,
    orderItemId: orderItem._id,
    product: product._id,
    fitOutcome,
    bodyMeasurements,
    preferredFit: preferredFit || undefined,

    garmentMeasurements: {
      pitToPit: measurements?.pitToPit ?? undefined,
      length: measurements?.length ?? undefined,
      shoulderWidth: measurements?.shoulderWidth ?? undefined,
      sleeveLength: measurements?.sleeveLength ?? undefined,
      waist: measurements?.waist ?? undefined,
      inseam: measurements?.inseam ?? undefined,
      tagSize: product.sizing?.tagSize || "",
      fabricComposition: product.condition?.fabricComposition || "",
    },

    consentToUseForTraining,
    consentedAt: consentToUseForTraining ? new Date() : null,
  });

  return res.status(201).json({
    success: true,
    message: "Fit feedback submitted successfully",
    feedback: {
      id: feedback._id,
      fitOutcome: feedback.fitOutcome,
      consentToUseForTraining: feedback.consentToUseForTraining,
    },
  });
});

module.exports = {
  submitFitFeedbackController,
};
