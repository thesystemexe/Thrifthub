const express = require("express");
const fitPredictionController = require("../controllers/fitPrediction.controller");
const authMiddleWare = require("../middlewares/auth.middle");

const fitPrediction = express.Router();

/**
 * @route POST http://localhost:4007/api/fit-prediction/predict
 * @desc predict user fit
 * @access admin
 */
fitPrediction.post(
  "/predict",
  authMiddleWare.authAdmin,
  fitPredictionController.predictGarmentFit,
);

module.exports = fitPrediction;
