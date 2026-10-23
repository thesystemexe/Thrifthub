const jwt = require("jsonwebtoken");
const HandleError = require("../utils/handleError");
const sellerRequestModel = require("../models/seller.model");
const userModel = require("../models/user.model");

const authUser = async (req, resp, next) => {
  const token = req.cookies.userToken;
  if (!token) {
    return next(new HandleError("token not provided", 401));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode || !decode.id) {
      return next(new HandleError("Not authorized. Please login again.", 401));
    }

    const user = await userModel.findById(decode.id);

    if (!user) {
      return next(new HandleError("User no longer exists.", 401));
    }

    if (user.accountStatus === "disabled") {
      return next(
        new HandleError(
          "Your account has been disabled. Please contact support.",
          403,
        ),
      );
    }

    req.user = {
      id: user._id,
      name: user.username,
      role: user.roles,
    };

    next();
  } catch (error) {
    return resp.status(401).json({
      message: error.message,
    });
  }
};

const authAdmin = async (req, resp, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    return next(new HandleError("token not provided", 401));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decode.role || !decode.role.includes("admin")) {
      return next(new HandleError("Access denied. Admin role required.", 403));
    }

    req.user = decode;
    next();
  } catch (error) {
    return resp.status(401).json({
      message: "Invalid token",
    });
  }
};

const authSeller = async (req, resp, next) => {
  try {
    const seller = await sellerRequestModel.findOne({
      user: req.user.id,
      status: "approved",
    });

    if (!seller) {
      return next(new HandleError("Seller is not approved", 403));
    }

    req.seller = seller;
    next();
  } catch (error) {
    return resp.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = { authUser, authAdmin, authSeller };
