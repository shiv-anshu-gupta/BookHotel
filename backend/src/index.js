const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

dotenv.config();
const { v2 } = require("cloudinary");

const userRoutes = require("./routes/users.js");
const authRoutes = require("./routes/auth.js");
const hotelRoutes = require("./routes/hotels.js");
const myHotelRoutes = require("./routes/my-hotels.js");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// ✅ Manual fallback CORS headers (set for every request)
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://shivanshurecidency.onrender.com"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// ✅ Express CORS middleware
app.use(
  cors({
    origin: "https://shivanshurecidency.onrender.com", // Frontend URL
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// ✅ Preflight support
app.options(
  "*",
  cors({
    origin: "https://shivanshurecidency.onrender.com",
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS works!", cookies: req.cookies });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);

// ✅ Global error handler to always send CORS headers
app.use((err, req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://shivanshurecidency.onrender.com"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
