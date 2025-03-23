const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users.js"); // Import users route
const authRoutes = require("./routes/auth.js");
const hotelRoutes = require("./routes/hotels.js");
const cookieParser = require("cookie-parser");
dotenv.config(); // Load environment variables
const { v2 } = require("cloudinary");
const myHotelRoutes = require("./routes/my-hotels.js");
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();

// Middlewares
app.use(
  cors({
    origin: "https://shivanshurecidency.onrender.com",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/api/test", (req, res) => {
  res.send("Hello World!");
});

// Mount the users route
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/my-hotels", myHotelRoutes);
app.use("/api/hotels", hotelRoutes);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const PORT = process.env.PORT | 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
