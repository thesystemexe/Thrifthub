const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transport = require("../config/nodemailer");
const handleAsyncError = require("../middlewares/handleAsyncError");
const HandleError = require("../utils/handleError");
const sendToken = require("../utils/jwtToken");

const CleanRegisterUserController = handleAsyncError(
  async (req, resp, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return next(
        new HandleError("Please provide the username,email and password", 400),
      );
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return next(
        new HandleError(
          "Account already exist with this username or email address",
          400,
        ),
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hash,
    });

    sendToken(user, 200, resp, "userToken");

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: email,
      subject: "Welcome to ThriftHub",
      text: `Welcome to ThriftHub! Your account has been created with email ID: ${email}`,
      html: `<h2>Welcome to ThriftHub!</h2><p>Your account has been created with email: <strong>${email}</strong></p>`,
    };

    try {
      const info = await transport.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      console.log("Accepted:", info.accepted);
    } catch (mailErr) {
      console.error("Email failed:", mailErr);
    }
  },
);

/**
 * @route Post /api/auth/register
 * @description register a new user
 * @access public
 */

const registerUserController = async (req, resp) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return resp.status(400).json({
        message: "Please provide username,email and password",
      });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return resp.status(400).json({
        message: "Account already exist with this username or email address",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hash,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.roles,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" },
    );

    resp.cookie("userToken", token);

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: email,
      subject: "Welcome to ThriftHub",
      text: `Welcome to ThriftHub! Your account has been created with email ID: ${email}`,
      html: `<h2>Welcome to ThriftHub!</h2><p>Your account has been created with email: <strong>${email}</strong></p>`,
    };

    // try {
    //   const info = await transport.sendMail(mailOptions);
    //   console.log("Email sent:", info.messageId);
    //   console.log("Accepted:", info.accepted);
    // } catch (mailErr) {
    //   console.error("Email failed:", mailErr);
    // }

    resp.status(201).json({
      message: "User registered Successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.roles,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

/**
 * @route Post /api/auth/login
 * @description login user with email and password
 * @access public
 */

const loginUserController = async (req, resp) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({
        message: "Please enter your email and password",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return resp.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return resp.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.roles },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" },
    );

    resp.cookie("userToken", token);

    resp.status(200).json({
      message: "User Logged in Successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.roles,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

/**
 * @route Post /api/auth/login
 * @description logout the user
 * @access public
 */

const logoutUserController = async (req, resp) => {
  try {
    resp.clearCookie("userToken");
    return resp.status(201).json({
      message: "User Logged out Successfully",
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error during logout",
      error: error.message,
    });
  }
};

/**
 *@route Post /api/auth/send-verify-otp
 * @description Send verification OTP to user's email
 * @access public
 */

const sendVerifyOtp = async (req, resp) => {
  try {
    const { id } = req.user;

    const user = await userModel.findById(id);

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAccountVerified) {
      return resp.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your account verification code is ${otp} , Verify your account using this OTP`,
    };

    await transport.sendMail(mailOptions);

    return resp.status(200).json({
      success: true,
      message: "Verification OTP sent on Email",
    });
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Server error during sending otp for verification",
      error: error.message,
    });
  }
};

/**
 * @route Post /api/auth/verify-account
 * @description To verify the account
 * @access private
 */

const verifyEmail = async (req, resp) => {
  const { id } = req.user;
  const { otp } = req.body;

  if (!id || !otp) {
    return resp.status(400).json({
      success: false,
      message: "Missing details",
    });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp != otp) {
      return resp.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return resp.status(400).json({
        success: false,
        message: "Otp is expired",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return resp.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Server error during email verification",
      error: error.message,
    });
  }
};

/**
 * @route Post /api/auth/is-auth
 * @description if the user is authenticated or not
 * @access private
 */

const isAuthenticated = async (req, resp) => {
  try {
    return resp.json({ success: true });
  } catch (error) {
    return resp.json({ success: false, message: error.message });
  }
};

/**
 * @route Post /api/auth/send-reset-otp
 * @description send reset otp
 * @access public
 */

const sendResetOtp = async (req, resp) => {
  const { email } = req.body;
  if (!email) {
    return resp
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return resp
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: user.email,
      subject: "Reset Verification OTP",
      text: `Your reset account verification code is ${otp} , Verify your account using this OTP`,
    };

    await transport.sendMail(mailOptions);

    return resp.status(200).json({
      success: true,
      message: "Reset Verification OTP sent on Email",
    });
  } catch (error) {
    return resp.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route Post /api/auth/verify-reset-password
 * @description reset user password
 * @access public
 */

const verifyResetOtp = async (req, resp) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return resp
      .status(400)
      .json({ success: false, message: "Email is and otp" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return resp
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== String(otp)) {
      return resp
        .status(400)
        .json({ success: false, message: "Provided OTP is wrong" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return resp
        .status(400)
        .json({ success: false, message: "OTP is expired" });
    }

    return resp.status(200).json({
      success: true,
      message: "Reset OTP verified successfully",
    });
  } catch (error) {
    return resp.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route Post /api/auth/reset-password
 * @description reset user password
 * @access public
 */

const resetPassword = async (req, resp) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return resp.status(400).json({
      success: false,
      message: "Please provide Email, OTP, and password",
    });
  }
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return resp
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== String(otp)) {
      return resp
        .status(400)
        .json({ success: false, message: "Provided OTP is wrong" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return resp
        .status(400)
        .json({ success: false, message: "OTP is expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return resp.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return resp.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route GET /api/user/data
 * @description To get the user data
 * @access private
 */

const getUserData = async (req, resp) => {
  try {
    const { id } = req.user;
    const user = await userModel.findById(id);

    if (!user) {
      return resp.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return resp.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.roles,
        isAccountVerified: user.isAccountVerified,
        favorites: user.favorites,
        cartData: user.cartData,
      },
    });
  } catch (error) {
    return resp.status(500).json({
      success: false,
      message: "Server error while fetching user data",
      error: error.message,
    });
  }
};

/**
 * @route GET /api/auth/admin/login
 * @description For admin login only
 * @access private
 */

const adminLoginController = async (req, resp) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return resp.status(400).json({
        message: "Please enter your email and password",
      });
    }

    const admin = await userModel.findOne({ email });
    if (!admin) {
      return resp.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!admin?.roles?.includes("admin")) {
      return resp.status(403).json({
        message: "You are not an admin",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return resp.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.roles,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "5d",
      },
    );

    resp.cookie("adminToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true only in production with HTTPS
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    resp.status(200).json({
      message: "User Logged in Successfully",
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.roles,
      },
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error during admin login",
      error: error.message,
    });
  }
};

/**
 * @route Get /api/auth/admin/logout
 * @description clear token from admin cookie and add it into blacklist
 * @access private
 */

const adminLogoutController = async (req, resp) => {
  try {
    resp.clearCookie("adminToken");
    resp.status(200).json({
      message: "Admin loggedOut successfully",
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error during logout",
      error: error.message,
    });
  }
};

/**
 * @route Get /api/auth/admin/get-me
 * @description get the admin details
 * @access private
 */

const adminGetMeController = async (req, resp) => {
  if (!req.user.id) {
    return resp.status(401).json({ message: "Unauthorized" });
  }
  try {
    const admin = await userModel.findById(req.user.id);

    if (!admin) {
      return resp.status(404).json({
        message: "Admin account not found",
      });
    }

    return resp.status(200).json({
      message: "Admin detail fetched successfully",
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.roles,
      },
    });
  } catch (error) {
    return resp.status(500).json({
      message: "Server error fetching admin details",
      error: error.message,
    });
  }
};

/**
 * @route Post /api/auth/update-password
 * @description update the user's old password
 * @access private
 */

const updateUserPasswordController = handleAsyncError(
  async (req, resp, next) => {
    const { id } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await userModel.findById(id);
    const isPasswordValid = user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      next(new HandleError("old password is incorrect", 400));
    }

    if (newPassword !== confirmPassword) {
      next(new HandleError("Password doesn't match", 400));
    }

    const hashedPassword = await bcrypt.hash(confirmPassword, 10);

    user.password = hashedPassword;
    await user.save();
    sendToken(user, 200, resp, "userToken");
  },
);

/**
 * @route Post /api/auth/update-profile
 * @description update the user's old profile
 * @access private
 */

const updateUserProfileController = handleAsyncError(
  async (req, resp, next) => {
    const { id } = req.user;
    const { name, email } = req.body;
    const updateUserDetails = { name, email };
    const user = await userModel.findByIdAndUpdate(id, updateUserDetails, {
      new: true,
      runValidators: true,
    });

    return resp.status(200).json({
      success: true,
      message: "User's profile updated successfully",
      user,
    });
  },
);

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  getUserData,
  adminLoginController,
  adminLogoutController,
  adminGetMeController,
  updateUserPasswordController,
  updateUserProfileController,
};
