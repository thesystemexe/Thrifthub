const { Blob } = require("node:buffer");

const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");
const Product = require("../models/product.model");
const ProductEmbedding = require("../models/productEmbedding.model");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

// Generate an embedding using the existing Python CLIP service.
async function createImageEmbedding(file) {
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || "upload.jpg",
  );

  let aiResponse;

  try {
    aiResponse = await fetch(`${AI_SERVICE_URL}/image-search/embed`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new HandleError("The AI service took too long to respond.", 504);
    }

    throw new HandleError(
      "Could not connect to the local AI service. Make sure Python is running.",
      502,
    );
  }

  if (!aiResponse.ok) {
    const errorBody = await aiResponse.text();
    console.error("Python AI service error:", aiResponse.status, errorBody);

    throw new HandleError("The AI service could not process the image.", 502);
  }

  const result = await aiResponse.json();

  if (
    !result.success ||
    !Array.isArray(result.embedding) ||
    result.embedding.length !== 512 ||
    !result.embedding.every(Number.isFinite)
  ) {
    throw new HandleError("The AI service returned an invalid embedding.", 502);
  }

  return result;
}

// Existing endpoint: generate an embedding without searching the catalogue.
const generateImageEmbedding = handleAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(
      new HandleError('Please upload an image using the field "image".', 400),
    );
  }

  const result = await createImageEmbedding(req.file);

  return res.status(200).json({
    success: true,
    message: "Image embedding generated successfully.",
    data: result,
  });
});

// New endpoint: search for visually similar products.
const searchSimilarProducts = handleAsyncError(async (req, res, next) => {
  if (!req.file) {
    return next(
      new HandleError('Please upload an image using the field "image".', 400),
    );
  }

  // 1. Generate an embedding for the customer's image.
  const queryResult = await createImageEmbedding(req.file);
  const queryEmbedding = queryResult.embedding;

  // 2. Load saved product embeddings.
  const savedEmbeddings = await ProductEmbedding.find({
    dimensions: queryEmbedding.length,
  })
    .select("product embedding model imageUrl")
    .lean();

  if (savedEmbeddings.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No product embeddings have been indexed yet.",
      results: [],
    });
  }

  // 3. Calculate cosine similarity.
  // Both query and catalogue embeddings are L2-normalized by CLIP,
  // so their dot product equals cosine similarity.
  const rankedEmbeddings = savedEmbeddings
    .filter(
      (item) =>
        Array.isArray(item.embedding) &&
        item.embedding.length === queryEmbedding.length,
    )
    .map((item) => {
      let similarity = 0;

      for (let i = 0; i < queryEmbedding.length; i++) {
        similarity += queryEmbedding[i] * item.embedding[i];
      }

      return {
        productId: String(item.product),
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  // 4. Keep only available products.
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 30)
    : 12;

  const candidateIds = rankedEmbeddings.map((item) => item.productId);

  const availableProducts = await Product.find({
    _id: { $in: candidateIds },
    status: "active",
    stock: { $gt: 0 },
  }).lean();

  // 5. Preserve similarity order after filtering products.
  const productsById = new Map(
    availableProducts.map((product) => [String(product._id), product]),
  );

  const results = rankedEmbeddings
    .filter((item) => productsById.has(item.productId))
    .slice(0, limit)
    .map((item) => ({
      product: productsById.get(item.productId),
      similarity: Number(item.similarity.toFixed(4)),
    }));

  return res.status(200).json({
    success: true,
    message: "Visual product search completed successfully.",
    count: results.length,
    model: queryResult.model,
    results,
  });
});

module.exports = {
  generateImageEmbedding,
  searchSimilarProducts,
};
