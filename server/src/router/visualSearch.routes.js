const express = require("express");
const upload = require("../middlewares/file.middle");
const visualSearchController = require("../controllers/visualSearch.controller");
const visualSearchRouter = express.Router();

// POST /api/visual-search/embedding
visualSearchRouter.post(
  "/embedding",
  upload.single("image"),
  visualSearchController.generateImageEmbedding,
);

// Search for visually similar products.
// POST api/visual-search/search
visualSearchRouter.post(
  "/search",
  upload.single("image"),
  visualSearchController.searchSimilarProducts,
);

module.exports = visualSearchRouter;

module.exports = visualSearchRouter;
