const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // -------------------------------------------------------------
    // 1. Seller & Ownership
    // -------------------------------------------------------------
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sellerRequest", // Reference to seller profile
      required: true,
      index: true,
    },

    // -------------------------------------------------------------
    // 2. Core Product Information
    // -------------------------------------------------------------
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true, // e.g., "Outerwear", "Denim", "Tops"
      index: true,
    },
    genderCategory: {
      type: String,
      default: "Unisex", // e.g., "Men", "Women", "Unisex"
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },
    era: {
      type: String,
      default: "Vintage", // e.g., "90s", "Y2K", "80s"
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    }, // Specific garment classification for AI features
    garmentType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Outfit recommendation features
    primaryColor: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      index: true,
    },

    colors: {
      type: [String],
      default: [],
    },

    pattern: {
      type: String,
      trim: true,
      lowercase: true,
      default: "unknown",
    },

    styleTags: {
      type: [String],
      default: [],
    },

    occasionTags: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // -------------------------------------------------------------
    // 3. Condition & Provenance
    // -------------------------------------------------------------
    condition: {
      grade: {
        type: String,
        default: "Good", // e.g., "New", "Excellent", "Distressed"
      },
      flaws: [String], // Array of strings e.g., ["Minor fading", "Small hole near hem"]
      madeInCountry: {
        type: String,
        default: "", // e.g., "Made in USA"
      },
      fabricComposition: {
        type: String,
        default: "", // e.g., "100% Cotton"
      },
    },

    // -------------------------------------------------------------
    // 4. Sizing & Flat Measurements (Inches)
    // -------------------------------------------------------------
    sizing: {
      unit: {
        type: String,
        enum: ["in"],
        default: "in",
      },
      tagSize: {
        type: String,
        required: [true, "Tag size is required"],
        trim: true, // e.g., "L", "W32 L30"
      },
      actualFitSize: {
        type: String,
        default: "", // e.g., "Fits like M"
      },
      measurements: {
        pitToPit: { type: Number, default: null },
        length: { type: Number, default: null },
        shoulderWidth: { type: Number, default: null },
        sleeveLength: { type: Number, default: null },
        waist: { type: Number, default: null },
        inseam: { type: Number, default: null },
      },
    },

    // -------------------------------------------------------------
    // 5. Cloudinary Image Assets
    // -------------------------------------------------------------
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    // -------------------------------------------------------------
    // 6. Pricing & Status
    // -------------------------------------------------------------
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    status: {
      type: String,
      default: "active",
      index: true,
    },

    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      default: 1,
      min: 0,
    },

    ratings: {
      type: Number,
      default: 0,
    },

    numOfReviews: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        name: {
          type: String,
          default: "",
        },
        rating: {
          type: Number,
          default: 0,
        },
        comment: {
          type: String,
          default: "",
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

// Basic text index for search
productSchema.index({
  title: "text",
  brand: "text",
  category: "text",
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

module.exports = productModel;
