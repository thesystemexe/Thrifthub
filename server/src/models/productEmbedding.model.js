const mongoose = require("mongoose");

const productEmbeddingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      unique: true,
      index: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
      default: "openai/clip-vit-base-patch32",
    },

    dimensions: {
      type: Number,
      required: true,
      default: 512,
    },

    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (values) =>
          Array.isArray(values) &&
          values.length === 512 &&
          values.every(Number.isFinite),
        message: "Embedding must contain 512 finite numbers.",
      },
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.productEmbedding ||
  mongoose.model("productEmbedding", productEmbeddingSchema);
