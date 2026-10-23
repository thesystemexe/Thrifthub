require("dotenv").config();

const mongoose = require("mongoose");
const { Blob } = require("node:buffer");
const Product = require("../src/models/product.model");
const ProductEmbedding = require("../src/models/productEmbedding.model");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

async function generateEmbeddingFromUrl(imageUrl) {
  // Download the existing Cloudinary image.
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

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(contentType)) {
    throw new Error(`Unsupported image type: ${contentType || "unknown"}`);
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  if (imageBuffer.length === 0 || imageBuffer.length > 3 * 1024 * 1024) {
    throw new Error("Image must be larger than 0 bytes and at most 3 MB.");
  }

  // Send the image directly to the Python service.
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
    result.embedding.length !== 512
  ) {
    throw new Error("The AI service returned an invalid embedding.");
  }

  return result;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from your backend .env file.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const products = await Product.find({
    "images.0.url": { $exists: true, $ne: "" },
  }).select("_id title images status");

  console.log(`Found ${products.length} products with a first image.`);

  let indexed = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const imageUrl = product.images?.[0]?.url;

    if (!imageUrl) {
      skipped++;
      continue;
    }

    try {
      // Reuse an embedding if the first image has not changed.
      const existing = await ProductEmbedding.findOne({
        product: product._id,
      }).select("imageUrl");

      if (existing?.imageUrl === imageUrl) {
        console.log(`SKIP: ${product.title} (already indexed)`);
        skipped++;
        continue;
      }

      console.log(`Indexing: ${product.title}`);

      const result = await generateEmbeddingFromUrl(imageUrl);

      await ProductEmbedding.findOneAndUpdate(
        { product: product._id },
        {
          $set: {
            product: product._id,
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

      indexed++;
      console.log(`SUCCESS: ${product.title}`);
    } catch (error) {
      failed++;
      console.error(`FAILED: ${product.title} — ${error.message}`);
    }
  }

  console.log("\nCatalogue indexing finished.");
  console.log({ total: products.length, indexed, skipped, failed });
}

main()
  .catch((error) => {
    console.error("Indexing script failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
