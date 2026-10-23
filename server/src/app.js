const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandleMiddleware = require("./middlewares/error");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user.model");

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

// In app.js or server.js
app.set("query parser", "extended");

// Socket.IO uses the same HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make Socket.IO available to controllers through req.app.get("io")
app.set("io", io);

// Authenticate every Socket.IO connection using the login cookie.
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const tokenCookie = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("userToken="));

    if (!tokenCookie) {
      return next(new Error("Authentication required"));
    }

    const token = decodeURIComponent(
      tokenCookie.substring("userToken=".length),
    );

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded?.id) {
      return next(new Error("Invalid authentication token"));
    }

    const user = await userModel
      .findById(decoded.id)
      .select("_id accountStatus");

    if (!user || user.accountStatus === "disabled") {
      return next(new Error("Account is unavailable"));
    }

    // Store the verified identity on the server-side socket.
    socket.data.userId = user._id.toString();

    next();
  } catch (error) {
    next(new Error("Socket authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userRoom = `user:${socket.data.userId}`;

  // Only the server decides which private room this socket can join.
  socket.join(userRoom);

  console.log(`Authenticated socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Api is working",
  });
});

const authRouters = require("./router/auth.routes");
const sellerRouters = require("./router/seller.routes");
const adminRouters = require("./router/admin.routes");
const productRouters = require("./router/product.routes");
const orderRouters = require("./router/order.routes");
const paymentRouters = require("./router/payment.routes");
const visualSearchRouters = require("./router/visualSearch.routes");
const notificationRouter = require("./router/notification.routes");
const fitPredictionRouters = require("./router/fitPrediction.routes");

app.use("/api/auth", authRouters);
app.use("/api/seller", sellerRouters);
app.use("/api/admin", adminRouters);
app.use("/api/product", productRouters);
app.use("/api", orderRouters);
app.use("/api", paymentRouters);
app.use("/api/visual-search", visualSearchRouters);
app.use("/api/fit-prediction", fitPredictionRouters);
app.use("/api/notifications", notificationRouter);

app.use(errorHandleMiddleware);

module.exports = { app, server, io };
