const mongoose = require("mongoose");

const fitFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      required: true,
    },

    // Identifies the exact item within order.orderItems.
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      index: true,
    },

    // Actual fit experienced by the buyer.
    fitOutcome: {
      type: String,
      enum: ["too_tight", "fits_well", "too_loose"],
      required: true,
    },

    // Body measurements submitted voluntarily, in inches.
    bodyMeasurements: {
      chest: { type: Number, min: 1, max: 100 },
      shoulderWidth: { type: Number, min: 1, max: 40 },
      height: { type: Number, min: 1, max: 100 },
      unit: {
        type: String,
        enum: ["in"],
        default: "in",
      },
    },

    preferredFit: {
      type: String,
      enum: ["slim", "regular", "relaxed"],
    },

    // Snapshot measurements at feedback time, in inches.
    garmentMeasurements: {
      pitToPit: { type: Number, min: 0 },
      length: { type: Number, min: 0 },
      shoulderWidth: { type: Number, min: 0 },
      sleeveLength: { type: Number, min: 0 },
      waist: { type: Number, min: 0 },
      inseam: { type: Number, min: 0 },
      tagSize: { type: String, default: "" },
      fabricComposition: { type: String, default: "" },
    },

    // Explicit permission for model-training use.
    consentToUseForTraining: {
      type: Boolean,
      required: true,
      default: false,
    },

    consentedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// One feedback record per purchased order item.
fitFeedbackSchema.index(
  { user: 1, order: 1, orderItemId: 1 },
  { unique: true },
);

module.exports =
  mongoose.models.fitFeedback ||
  mongoose.model("fitFeedback", fitFeedbackSchema);
