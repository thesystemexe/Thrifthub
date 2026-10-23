const paymentRouter = require("express").Router();
const authMiddleware = require("../middlewares/auth.middle");
const paymentController = require("../controllers/payment.controller");
const authorize = require("../middlewares/role.authorize");

paymentRouter.post(
  "/payment/process",
  authMiddleware.authUser,
  authorize("user"),
  paymentController.processPaymentController,
);

paymentRouter.get(
  "/getKey",
  authMiddleware.authUser,
  authorize("user"),
  paymentController.sendAPIkeyController,
);

paymentRouter.post(
  "/paymentVerification",
  authMiddleware.authUser,
  authorize("user"),
  paymentController.paymentVerificationController,
);

module.exports = paymentRouter;
