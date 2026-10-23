const { Blob } = require("node:buffer");

const ProductEmbedding = require("../models/productEmbedding.model");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

async function generateEmbeddingFromUrl(imageUrl) {
  const imageResponse = await fetch(imageUrl, {
    signal: AbortSignal.timeout(30000),
  });

  if (!imageResponse.ok) {
    throw new Error(`Image download failed: HTTP ${imageResponse.status}`);
  }

  const contentType = (imageResponse.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (!["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error(`Unsupported image type: ${contentType || "unknown"}`);
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  if (imageBuffer.length === 0 || imageBuffer.length > 3 * 1024 * 1024) {
    throw new Error("Image must be larger than 0 bytes and at most 3 MB.");
  }

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([imageBuffer], { type: contentType }),
    "product-image",
  );

  const aiResponse = await fetch(`${AI_SERVICE_URL}/image-search/embed`, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(60000),
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    throw new Error(
      `AI service returned HTTP ${aiResponse.status}: ${errorText}`,
    );
  }

  const result = await aiResponse.json();

  if (
    !result.success ||
    !Array.isArray(result.embedding) ||
    result.embedding.length !== 512 ||
    !result.embedding.every(Number.isFinite)
  ) {
    throw new Error("The AI service returned an invalid embedding.");
  }

  return result;
}

async function syncProductEmbedding(productId, imageUrl) {
  // Remove any old vector before indexing the replacement image.
  await ProductEmbedding.deleteOne({ product: productId });

  if (!imageUrl) {
    return;
  }

  const result = await generateEmbeddingFromUrl(imageUrl);

  await ProductEmbedding.findOneAndUpdate(
    { product: productId },
    {
      $set: {
        product: productId,
        imageUrl,
        model: result.model,
        dimensions: result.dimensions,
        embedding: result.embedding,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function deleteProductEmbedding(productId) {
  await ProductEmbedding.deleteOne({ product: productId });
}

module.exports = {
  syncProductEmbedding,
  deleteProductEmbedding,
};
