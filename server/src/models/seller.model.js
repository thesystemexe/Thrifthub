const mongoose = require("mongoose");

const sellerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // Prevents multiple active requests from the same user
    },

    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    storeDescription: {
      type: String,
      required: [true, "Store description is required"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },

    businessAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },

    // Identity / Business verification documents (Cloudinary URLs)
    documents: [
      {
        docType: {
          type: String,
          enum: ["ID_Card", "Business_License", "Tax_Doc"],
        },
        url: { type: String, required: true },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    adminComment: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // The admin who approved/rejected the request
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const sellerRequestModel =
  mongoose.models.sellerRequest ||
  mongoose.model("sellerRequest", sellerRequestSchema);

module.exports = sellerRequestModel;
