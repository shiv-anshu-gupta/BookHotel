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

// ✅ Move CORS to the top
app.use(
  cors({
    origin: [
      "https://shivanshurecidency.onrender.com",
      "http://localhost:5173",
    ], // Allow both production & local frontend
    credentials: true, // Allow sending cookies
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test Route
app.get("/api/test", (req, res) => {
  res.send("Hello World!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
