const HandleError = require("../utils/handleError");

module.exports = (error, req, resp, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Internal server error";

  //CastError
  if (error.name === "CastError") {
    const message = `This is invalid resource ${error.path}`;
    error = new HandleError(message, 404);
  }

  // Duplicate key error
  if (error.code === 11000) {
    const message = `This ${Object.keys(error.keyValue)} is already registered. please login to continue`;
    error = new HandleError(message, 400);
  }

  resp.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
