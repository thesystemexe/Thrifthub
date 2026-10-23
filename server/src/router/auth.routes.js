const authController = require("../controllers/auth.controller");
const authRouter = require("express").Router();
const authMiddleware = require("../middlewares/auth.middle");

/**
 * @route Post /api/auth/register
 * @description register a new user
 * @access public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route Post /api/auth/login
 * @description login a new user with email and password
 * @access public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route Post /api/auth/logout
 * @description user logout
 * @access public
 */

authRouter.post("/logout", authController.logoutUserController);

/**
 * @route Post /api/auth/send-verify-otp
 * @description send verification otp code to user
 * @access private
 */

authRouter.post(
  "/send-verify-otp",
  authMiddleware.authUser,
  authController.sendVerifyOtp,
);

/**
 * @route Post /api/auth/verify-account
 * @description verify account of the user
 * @access public
 */

authRouter.post(
  "/verify-account",
  authMiddleware.authUser,
  authController.verifyEmail,
);

/**
 * @route Post /api/auth/is-auth
 * @description to check if the user is authenticated or not
 * @access public
 */

authRouter.get(
  "/is-auth",
  authMiddleware.authUser,
  authController.isAuthenticated,
);

/**
 * @route Post /api/auth/send-reset-otp
 * @description a reset verification otp is sent to user's email
 * @access public
 */

authRouter.post("/send-reset-otp", authController.sendResetOtp);

/**
 * @route Post /api/auth/verify-reset-otp
 * @description verifying the reset opt sent to user
 * @access public
 */

authRouter.post("/verify-reset-otp", authController.verifyResetOtp);

/**
 * @route Post /api/auth/reset-password
 * @description to reset the users old password
 * @access public
 */

authRouter.post("/reset-password", authController.resetPassword);

/**
 * @route GET /api/auth/user-data
 * @description To get the user data
 * @access private
 */

authRouter.get(
  "/user-data",
  authMiddleware.authUser,
  authController.getUserData,
);

/**
 * @route GET /api/auth/admin/login
 * @description For admin login only
 * @access private
 */

authRouter.post("/admin/login", authController.adminLoginController);

/**
 * @route GET /api/auth/admin/logout
 * @description For admin login only
 * @access private
 */

authRouter.post("/admin/logout", authController.adminLogoutController);

/**
 * @route Get /api/auth/admin/get-me
 * @description get the admin details
 * @access private
 */

authRouter.get(
  "/admin/get-me",
  authMiddleware.authAdmin,
  authController.adminGetMeController,
);

module.exports = authRouter;
