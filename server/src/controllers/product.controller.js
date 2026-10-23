const mongoose = require("mongoose");
const productModel = require("../models/product.model");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError.js");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const APIFunctionality = require("../utils/apiFunctionality");
const cloudinary = require("../config/cloudinary");
const userModel = require("../models/user.model");
const {
  syncProductEmbedding,
  deleteProductEmbedding,
} = require("../utils/syncProductEmbedding.js");
const {
  toNullableNumber,
  parseStringArray,
  normalizeGarmentType,
} = require("../utils/productMetadata");

/**
 * @route Post /api/product/create-product
 * @description create a new product
 * @access public
 */

const uploadProductController = handleAsyncError(async (req, resp, next) => {
  if (!req.seller._id) {
    return next(new HandleError("Seller not found", 401));
  }

  const {
    title,
    category,
    garmentType,
    genderCategory,
    brand,
    era,
    description,
    grade,
    flaws,
    madeInCountry,
    fabricComposition,
    tagSize,
    actualFitSize,
    pitToPit,
    length,
    shoulderWidth,
    sleeveLength,
    waist,
    inseam,
    price,
    stock,
    primaryColor,
    colors,
    pattern,
    styleTags,
    occasionTags,
    material,
  } = req.body;

  let parsedFlaws;
  let parsedColors;
  let parsedStyleTags;
  let parsedOccasionTags;
  let normalizedGarmentType;
  let measurements;

  try {
    parsedFlaws = parseStringArray(flaws, "Flaws");
    parsedColors = parseStringArray(colors, "Colors");
    parsedStyleTags = parseStringArray(styleTags, "Style tags");
    parsedOccasionTags = parseStringArray(occasionTags, "Occasion tags");
    normalizedGarmentType = normalizeGarmentType(garmentType);

    measurements = {
      pitToPit: toNullableNumber(pitToPit, "Pit-to-pit"),
      length: toNullableNumber(length, "Length"),
      shoulderWidth: toNullableNumber(shoulderWidth, "Shoulder width"),
      sleeveLength: toNullableNumber(sleeveLength, "Sleeve length"),
      waist: toNullableNumber(waist, "Waist"),
      inseam: toNullableNumber(inseam, "Inseam"),
    };
  } catch (error) {
    return next(new HandleError(error.message, 400));
  }

  const imageFiles =
    req.files?.images || (Array.isArray(req.files) ? req.files : []);

  const uploadImages = await Promise.all(
    imageFiles.map(async (file) => {
      const result = await uploadToCloudinary(
        file.buffer,
        "product_images",
        "auto",
      );

      return {
        publicId: result.public_id,
        url: result.secure_url,
      };
    }),
  );

  const productData = {
    seller: req.seller._id,
    title,
    category,
    garmentType: normalizedGarmentType,
    genderCategory,
    brand,
    era,
    description,

    condition: {
      grade,
      flaws: parsedFlaws,
      madeInCountry: madeInCountry || "",
      fabricComposition: fabricComposition || "",
    },

    sizing: {
      tagSize,
      actualFitSize: actualFitSize || "",
      measurements,
    },

    // Outfit recommendation metadata
    primaryColor: (primaryColor || "").trim().toLowerCase(),
    colors: parsedColors,
    pattern: (pattern || "unknown").trim().toLowerCase(),
    styleTags: parsedStyleTags,
    occasionTags: parsedOccasionTags,
    material: (material || "").trim().toLowerCase(),

    images: uploadImages,
    price,
    stock,
  };

  const product = await productModel.create(productData);

  // Index the first product image for AI visual search.
  let embeddingStatus = "indexed";

  try {
    const firstImageUrl = product.images?.[0]?.url;

    if (firstImageUrl) {
      await syncProductEmbedding(product._id, firstImageUrl);
    } else {
      embeddingStatus = "pending";
    }
  } catch (error) {
    embeddingStatus = "pending";
    console.error(
      `AI embedding failed for product ${product._id}:`,
      error.message,
    );
  }

  return resp.status(201).json({
    success: true,
    message: "Product uploaded successfully",
    product,
    embeddingStatus,
  });
});

/**
 * @route   GET /api/product/get-all-products
 * @description Fetch all products
 * @access  Public
 */

const getAllProductsController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 6;
  const apiFeatures = new APIFunctionality(productModel.find(), req.query)
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
 * @route   PUT /api/product/update-product/:productId
 * @description Update an existing product by ID
 * @access  Public
 */

const updateProductController = handleAsyncError(async (req, resp, next) => {
  const { productId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.seller._id,
  });

  if (!product) {
    return next(
      new HandleError(
        "Product not found or you are not authorized to edit it",
        404,
      ),
    );
  }

  const previousFirstImageUrl = product.images?.[0]?.url || "";

  // =========================================
  // EXISTING IMAGES TO KEEP
  // =========================================
  let existingImages = (product.images || []).map((image) => ({
    publicId: image.publicId,
    url: image.url,
  }));

  if (req.body.existingImages !== undefined) {
    try {
      existingImages =
        typeof req.body.existingImages === "string"
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
    } catch {
      return next(new HandleError("Invalid existing images format", 400));
    }
  }

  if (
    !Array.isArray(existingImages) ||
    existingImages.some(
      (image) =>
        !image ||
        typeof image.url !== "string" ||
        typeof image.publicId !== "string",
    )
  ) {
    return next(new HandleError("Invalid existing images", 400));
  }

  // =========================================
  // FIELD MAPPING
  // =========================================
  const fieldMapping = {
    // Condition
    grade: "condition.grade",
    flaws: "condition.flaws",
    madeInCountry: "condition.madeInCountry",
    fabricComposition: "condition.fabricComposition",

    // Sizing
    tagSize: "sizing.tagSize",
    actualFitSize: "sizing.actualFitSize",

    // Measurements
    pitToPit: "sizing.measurements.pitToPit",
    length: "sizing.measurements.length",
    shoulderWidth: "sizing.measurements.shoulderWidth",
    sleeveLength: "sizing.measurements.sleeveLength",
    waist: "sizing.measurements.waist",
    inseam: "sizing.measurements.inseam",
  };

  const measurementFields = [
    "pitToPit",
    "length",
    "shoulderWidth",
    "sleeveLength",
    "waist",
    "inseam",
  ];

  const arrayFields = ["colors", "styleTags", "occasionTags"];

  const updateFields = {};

  Object.keys(req.body).forEach((key) => {
    // These are handled separately
    if (key === "existingImages" || key === "images" || key === "flaws") {
      return;
    }

    if (req.body[key] === undefined) {
      return;
    }

    const schemaPath = fieldMapping[key] || key;
    let value = req.body[key];

    // Convert empty measurement fields to null and other values to numbers
    if (measurementFields.includes(key)) {
      value = value === "" || value === null ? null : Number(value);

      if (value !== null && !Number.isFinite(value)) {
        return;
      }
    }

    // Convert comma-separated metadata fields into arrays
    if (arrayFields.includes(key)) {
      try {
        value =
          typeof value === "string"
            ? value.trim() === ""
              ? []
              : JSON.parse(value)
            : value;

        if (typeof value === "string") {
          value = value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        if (!Array.isArray(value)) {
          value = String(req.body[key])
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
        value = String(req.body[key])
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    updateFields[schemaPath] = value;
  });

  // =========================================
  // PARSE FLAWS ARRAY
  // =========================================
  if (req.body.flaws !== undefined) {
    try {
      const parsedFlaws =
        typeof req.body.flaws === "string"
          ? JSON.parse(req.body.flaws)
          : req.body.flaws;

      if (!Array.isArray(parsedFlaws)) {
        return next(new HandleError("Flaws must be an array", 400));
      }

      updateFields["condition.flaws"] = parsedFlaws;
    } catch {
      return next(new HandleError("Invalid flaws format", 400));
    }
  }

  // =========================================
  // UPLOAD NEW IMAGES
  // =========================================
  const imageFiles =
    req.files?.images || (Array.isArray(req.files) ? req.files : []);

  let newImages = [];

  if (imageFiles.length > 0) {
    newImages = await Promise.all(
      imageFiles.map(async (file) => {
        const result = await uploadToCloudinary(
          file.buffer,
          "product_images",
          "auto",
        );

        return {
          publicId: result.public_id,
          url: result.secure_url,
        };
      }),
    );
  }

  // =========================================
  // FINAL IMAGE ARRAY
  // =========================================
  const finalImages = [...existingImages, ...newImages];
  updateFields.images = finalImages;

  // =========================================
  // UPDATE PRODUCT
  // =========================================
  const updatedProduct = await productModel.findOneAndUpdate(
    {
      _id: productId,
      seller: req.seller._id,
    },
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProduct) {
    return next(
      new HandleError(
        "Product not found or you are not authorized to edit it",
        404,
      ),
    );
  }

  // =========================================
  // DELETE REMOVED OLD IMAGES AFTER DB UPDATE
  // =========================================
  const keptPublicIds = new Set(
    finalImages.map((image) => image.publicId).filter(Boolean),
  );

  const imagesToDelete = (product.images || []).filter(
    (image) => image.publicId && !keptPublicIds.has(image.publicId),
  );

  await Promise.allSettled(
    imagesToDelete.map((image) => cloudinary.uploader.destroy(image.publicId)),
  );

  // =========================================
  // UPDATE AI EMBEDDING IF FIRST IMAGE CHANGED
  // =========================================
  let embeddingStatus = "unchanged";

  const updatedFirstImageUrl = updatedProduct.images?.[0]?.url || "";

  if (previousFirstImageUrl !== updatedFirstImageUrl) {
    try {
      await syncProductEmbedding(updatedProduct._id, updatedFirstImageUrl);

      embeddingStatus = updatedFirstImageUrl ? "indexed" : "no_image";
    } catch (error) {
      embeddingStatus = "pending";

      console.error(
        `AI embedding update failed for product ${updatedProduct._id}:`,
        error.message,
      );
    }
  }

  return resp.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct,
    embeddingStatus,
  });
});

/**
 * @route   DELETE /api/product/delete-product/:productId
 * @description Delete a product by ID
 * @access  Public
 */

const deleteProductController = handleAsyncError(async (req, resp, next) => {
  const { productId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    seller: req.seller._id,
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

  for (let i = 0; i < product.images.length; i++) {
    if (product.images[i].publicId) {
      await cloudinary.uploader.destroy(product.images[i].publicId);
    }
  }

  try {
    await deleteProductEmbedding(product._id);
  } catch (error) {
    // Product deletion should not be undone because index cleanup failed.
    console.error(
      `Failed to delete embedding for product ${product._id}:`,
      error.message,
    );
  }

  return resp.status(200).json({
    success: true,
    message: "Product deleted successfully",
    deletedProduct,
  });
});

/**
 * @route   POST /api/product/review
 * @description create a review for a product
 * @access  Public
 */

const createReviewForProductController = handleAsyncError(
  async (req, resp, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    const reviewExists = product.reviews.find(
      (review) => review.user.toString() === req.user.id.toString(),
    );

    if (reviewExists) {
      product.reviews.forEach((review) => {
        if (review.user.toString() === req.user.id.toString()) {
          review.rating = Number(rating);
          review.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
    }

    product.numOfReviews = product.reviews.length;
    let avg = 0;
    product.reviews.forEach((review) => (avg += review.rating));
    product.ratings =
      product.reviews.length > 0 ? avg / product.reviews.length : 0;

    await product.save({ validateBeforeSave: false });
    resp.status(200).json({
      success: true,
      product,
    });
  },
);

/**
 * @route   GET /api/product/reviews
 * @description Get reviews for a specific product
 * @access  User
 */

const getProductReviewsController = handleAsyncError(
  async (req, resp, next) => {
    const { id } = req.query;

    const product = await productModel.findById(id);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    return resp.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  },
);

/**
 * @route   GET /api/admin/reviews
 * @description Get all product reviews for admin management
 * @access  Admin
 */

const getAllReviewsController = handleAsyncError(async (req, resp, next) => {
  const resultPerPage = 6;

  const page = Number(req.query.page) || 1;

  const products = await productModel
    .find(
      { "reviews.0": { $exists: true } },
      {
        title: 1,
        images: 1,
        reviews: 1,
      },
    )
    .lean();

  const reviews = [];

  products.forEach((product) => {
    product.reviews.forEach((review) => {
      reviews.push({
        _id: review._id,
        user: review.user,
        name: review.name,
        rating: review.rating,
        comment: review.comment,

        product: {
          _id: product._id,
          name: product.title,
          image: product.images?.[0].url || "",
        },
      });
    });
  });

  const reviewCount = reviews.length;

  const totalPages = Math.ceil(reviewCount / resultPerPage);

  if (page > totalPages && reviewCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  const startIndex = (page - 1) * resultPerPage;
  const endIndex = startIndex + resultPerPage;

  const paginatedReviews = reviews.slice(startIndex, endIndex);

  if (!paginatedReviews.length && reviewCount === 0) {
    return next(new HandleError("No reviews found", 404));
  }

  return resp.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    reviews: paginatedReviews,
    reviewCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

/**
 * @route   GET /api/admin/product/:productId/reviews
 * @description Get reviews for a specific product for admin
 * @access  Admin
 */

const getAdminProductReviewsController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;

    const product = await productModel
      .findById(productId)
      .select("title images reviews ratings numOfReviews");

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    return resp.status(200).json({
      success: true,
      message: "Product reviews fetched successfully",
      product: {
        _id: product._id,
        name: product.title,
        image: product.images?.[0] || "",
        rating: product.ratings,
        numOfReviews: product.numOfReviews,
      },
      reviews: product.reviews,
    });
  },
);

/**
 * @route   DELETE /api/product/:productId/admin/review/:reviewId
 * @description Delete a specific product review and update product rating
 * @access  Admin
 */

const adminDeleteReviewController = handleAsyncError(
  async (req, resp, next) => {
    const { productId, reviewId } = req.params;

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    const reviewExists = product.reviews.some(
      (review) => review._id.toString() === reviewId.toString(),
    );

    if (!reviewExists) {
      return next(new HandleError("Review not found", 404));
    }

    const reviews = product.reviews.filter(
      (review) => review._id.toString() !== reviewId.toString(),
    );

    const rating =
      reviews.length > 0
        ? reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        : 0;

    const numOfReviews = reviews.length;

    product.reviews = reviews;
    product.numOfReviews = numOfReviews;
    product.rating = rating;

    await product.save();

    return resp.status(200).json({
      success: true,
      message: "Review deleted successfully",
      product,
    });
  },
);

/**
 * @route   GET /api/product/:productId
 * @description Fetch a single product by ID
 * @access  Public
 */

const getASingleProductController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    return resp.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  },
);

/**
 * @route   PATCH /api/product/favorite/:productId",
 * @description Add to favorite
 * @access  Public
 */

const toggleFavoriteController = handleAsyncError(async (req, resp, next) => {
  const { productId } = req.params;

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const favoriteIndex = user.favorites.findIndex(
    (id) => id.toString() === productId.toString(),
  );

  // REMOVE
  if (favoriteIndex !== -1) {
    user.favorites.splice(favoriteIndex, 1);

    await user.save();

    return resp.status(200).json({
      success: true,
      message: "Product removed from favorites",
      isFavorite: false,
      productId,
    });
  }

  // ADD
  user.favorites.push(productId);

  await user.save();

  return resp.status(200).json({
    success: true,
    message: "Product added to favorites",
    isFavorite: true,
    productId,
  });
});

/**
 * @route   GET /api/product/favorites",
 * @description get All favorites of logged in user
 * @access  Public
 */

const getMyFavoritesController = handleAsyncError(async (req, resp, next) => {
  const user = await userModel.findById(req.user.id).populate("favorites");
  if (!user) {
    return next(new HandleError("User not found", 404));
  }
  return resp.status(200).json({
    success: true,
    favorites: user.favorites,
  });
});

/**
 * @route   DELETE /api/product/user/favorites/clear",
 * @description clear all favorites
 * @access  Public
 */

const clearFavoritesController = handleAsyncError(async (req, resp, next) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  user.favorites = [];
  await user.save();

  return resp.status(200).json({
    success: true,
    message: "All favorites cleared successfully",
  });
});

/**
 * @route   POST /api/product/user/addToCart",
 * @description Add to cart
 * @access  Public
 */

const addToCartController = handleAsyncError(async (req, resp, next) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return next(
      new HandleError("Product and valid quantity are required", 400),
    );
  }

  const product = await productModel.findById(productId);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  if (product.stock < quantity) {
    return next(new HandleError("Not enough stock available", 400));
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  const existingItem = user.cartData.find(
    (item) => item.product.toString() === productId.toString(),
  );

  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    user.cartData.push({
      product: productId,
      quantity,
    });
  }

  await user.save();

  const updatedUser = await userModel
    .findById(req.user.id)
    .populate("cartData.product");

  return resp.status(200).json({
    success: true,
    message: "Product added to cart",
    cartData: updatedUser.cartData,
  });
});

/**
 * @route   POST /api/product/user/cart",
 * @description Add to cart
 * @access  Public
 */

const getMyCartController = handleAsyncError(async (req, resp, next) => {
  const user = await userModel
    .findById(req.user.id)
    .populate("cartData.product");

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  return resp.status(200).json({
    success: true,
    cartData: user.cartData,
  });
});

/**
 * @route   POST /api/product/user/cart/:productId",
 * @description Add to cart
 * @access  Public
 */

const updateCartQuantityController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(new HandleError("Quantity must be at least 1", 400));
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    if (product.stock < quantity) {
      return next(new HandleError("Not enough stock available", 400));
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return next(new HandleError("User not found", 404));
    }

    const cartItem = user.cartData.find(
      (item) => item.product.toString() === productId.toString(),
    );

    if (!cartItem) {
      return next(new HandleError("Product is not in your cart", 404));
    }

    cartItem.quantity = quantity;

    await user.save();

    const updatedUser = await userModel
      .findById(req.user.id)
      .populate("cartData.product");

    return resp.status(200).json({
      success: true,
      message: "Product added to cart",
      cartData: updatedUser.cartData,
    });
  },
);

/**
 * @route   POST /api/product/user/cart/:productId",
 * @description Add to cart
 * @access  Public
 */

const removeFromCartController = handleAsyncError(async (req, resp, next) => {
  const { productId } = req.params;

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  const cartItemExists = user.cartData.some(
    (item) => item.product.toString() === productId.toString(),
  );

  if (!cartItemExists) {
    return next(new HandleError("Product is not in your cart", 404));
  }

  user.cartData = user.cartData.filter(
    (item) => item.product.toString() !== productId.toString(),
  );

  await user.save();

  const updatedUser = await userModel
    .findById(req.user.id)
    .populate("cartData.product");

  return resp.status(200).json({
    success: true,
    message: "Product added to cart",
    cartData: updatedUser.cartData,
  });
});

/**
 * @route   POST /api/product/user/cart",
 * @description Add to cart
 * @access  Public
 */

const clearCartController = handleAsyncError(async (req, resp, next) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  user.cartData = [];

  await user.save();

  return resp.status(200).json({
    success: true,
    message: "Cart cleared successfully",
    cartData: [],
  });
});

/**
 * @route   POST /api/product/:productId/size-recommendation
 * @description Estimate how a top or shirt may fit the buyer
 * @access  Authenticated user or seller
 */
const getSizeRecommendationController = handleAsyncError(
  async (req, resp, next) => {
    const { productId } = req.params;
    const { chest, shoulderWidth, preferredFit = "regular" } = req.body;

    // Validate product ID before querying MongoDB.
    if (!mongoose.isValidObjectId(productId)) {
      return next(new HandleError("Invalid product ID", 400));
    }

    // Body chest circumference must be supplied in inches.
    const bodyChest = Number(chest);

    if (
      chest === undefined ||
      chest === null ||
      String(chest).trim() === "" ||
      !Number.isFinite(bodyChest) ||
      bodyChest <= 0 ||
      bodyChest > 100
    ) {
      return next(
        new HandleError(
          "Enter a valid body chest circumference in inches",
          400,
        ),
      );
    }

    const allowedFits = ["slim", "regular", "relaxed"];

    if (!allowedFits.includes(preferredFit)) {
      return next(
        new HandleError("Preferred fit must be slim, regular, or relaxed", 400),
      );
    }

    let bodyShoulder;

    if (
      shoulderWidth !== undefined &&
      shoulderWidth !== null &&
      String(shoulderWidth).trim() !== ""
    ) {
      bodyShoulder = Number(shoulderWidth);

      if (
        !Number.isFinite(bodyShoulder) ||
        bodyShoulder <= 0 ||
        bodyShoulder > 40
      ) {
        return next(
          new HandleError("Enter a valid body shoulder width in inches", 400),
        );
      }
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return next(new HandleError("Product not found", 404));
    }

    if (product.status !== "active" || product.stock < 1) {
      return next(
        new HandleError("This product is currently unavailable", 400),
      );
    }

    const measurements = product.sizing?.measurements;

    // We need pit-to-pit width to estimate chest ease.
    const pitToPit = Number(measurements?.pitToPit);

    if (
      measurements?.pitToPit == null ||
      !Number.isFinite(pitToPit) ||
      pitToPit <= 0
    ) {
      return resp.status(200).json({
        success: true,
        recommendationAvailable: false,
        message: "This item does not have a usable chest measurement yet.",
        missingMeasurements: ["pitToPit"],
      });
    }

    // Pit-to-pit is a flat width; double it to estimate circumference.
    const garmentChest = pitToPit * 2;
    const chestEase = garmentChest - bodyChest;

    let estimatedFit;

    if (chestEase < 2) {
      estimatedFit = "very tight";
    } else if (chestEase < 4) {
      estimatedFit = "slim";
    } else if (chestEase < 6) {
      estimatedFit = "regular";
    } else if (chestEase < 8) {
      estimatedFit = "relaxed";
    } else {
      estimatedFit = "oversized";
    }

    const explanations = [
      `Estimated garment chest circumference: ${garmentChest.toFixed(1)} inches.`,
      `Difference between garment and body chest: ${chestEase.toFixed(1)} inches.`,
    ];

    let shoulderAssessment = null;

    const garmentShoulder = measurements?.shoulderWidth;

    if (
      bodyShoulder !== undefined &&
      garmentShoulder != null &&
      Number.isFinite(Number(garmentShoulder)) &&
      Number(garmentShoulder) > 0
    ) {
      const shoulderDifference = Number(garmentShoulder) - bodyShoulder;

      shoulderAssessment = {
        garmentShoulderWidth: Number(garmentShoulder),
        bodyShoulderWidth: bodyShoulder,
        differenceInches: Number(shoulderDifference.toFixed(1)),
        note: "Shoulder fit also depends on garment construction and how the measurements were taken.",
      };

      explanations.push(
        `Shoulder width difference: ${shoulderDifference.toFixed(1)} inches.`,
      );
    }

    const preferenceMatches = {
      slim: chestEase >= 2 && chestEase < 4,
      regular: chestEase >= 4 && chestEase < 6,
      relaxed: chestEase >= 6 && chestEase < 8,
    };

    return resp.status(200).json({
      success: true,
      recommendationAvailable: true,
      product: {
        id: product._id,
        title: product.title,
        tagSize: product.sizing?.tagSize || "Not specified",
        actualFitSize: product.sizing?.actualFitSize || "",
      },
      input: {
        bodyChest,
        bodyShoulder: bodyShoulder ?? null,
        preferredFit,
        unit: "inches",
      },
      recommendation: {
        estimatedFit,
        preferredFit,
        preferenceMatches: preferenceMatches[preferredFit],
        chestEaseInches: Number(chestEase.toFixed(1)),
        garmentChestCircumferenceInches: Number(garmentChest.toFixed(1)),
        shoulderAssessment,
        explanations,
        limitations: [
          "This is an initial measurement-based estimate, not a trained AI prediction.",
          "Fabric stretch, garment cut, and measurement accuracy can change the actual fit.",
          "The estimate uses chest ease; it cannot guarantee the overall fit.",
        ],
      },
    });
  },
);

module.exports = {
  uploadProductController,
  getAllProductsController,
  updateProductController,
  deleteProductController,
  getASingleProductController,
  createReviewForProductController,
  getProductReviewsController,
  getAllReviewsController,
  getAdminProductReviewsController,
  adminDeleteReviewController,
  getASingleProductController,
  toggleFavoriteController,
  getMyFavoritesController,
  clearFavoritesController,
  addToCartController,
  getMyCartController,
  updateCartQuantityController,
  removeFromCartController,
  clearCartController,
  getSizeRecommendationController,
};
