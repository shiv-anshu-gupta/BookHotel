const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { body } = require("express-validator");
const router = express.Router();
const Hotel = require("../models/hotels");
const verifyToken = require("../middleware/auth");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Validation Rules
const validateHotel = [
  body("name").notEmpty().withMessage("Name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("type").notEmpty().withMessage("Type is required"),
  body("adultCount")
    .isInt({ min: 1 })
    .withMessage("Adult count must be at least 1"),
  body("childCount")
    .isInt({ min: 0 })
    .withMessage("Child count must be 0 or more"),
  body("facilities")
    .isArray({ min: 1 })
    .withMessage("At least one facility is required"),
  body("pricePerNight")
    .isFloat({ min: 0 })
    .withMessage("Price per night must be a positive number"),
  body("starRating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Star rating must be between 1 and 5"),
];

// Function to upload images to Cloudinary
const uploadImages = async (imageFiles) => {
  return Promise.all(
    imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      const dataURI = `data:${image.mimetype};base64,${b64}`;
      const uploadResponse = await cloudinary.uploader.upload(dataURI);
      return uploadResponse.url;
    })
  );
};

// Hotel creation route
router.post(
  "/",
  verifyToken,
  validateHotel,
  upload.array("imageFiles", 6),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body); // Debugging
      const imageFiles = req.files || [];
      const newHotel = { ...req.body };

      // Ensure required fields exist and convert to correct types
      if (!newHotel.pricePerNight) {
        return res.status(400).json({ message: "Price per night is required" });
      }
      newHotel.pricePerNight = parseFloat(newHotel.pricePerNight);
      newHotel.adultCount = parseInt(newHotel.adultCount, 10);
      newHotel.childCount = parseInt(newHotel.childCount || 0, 10);
      newHotel.starRating = parseInt(newHotel.starRating, 10);

      // Ensure userId is set
      if (!req.userId) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No userId found" });
      }
      newHotel.userId = req.userId;
      newHotel.lastUpdated = new Date();

      // Upload images to Cloudinary
      newHotel.imageUrls = await uploadImages(imageFiles);

      // Save hotel to database
      const hotel = new Hotel(newHotel);
      await hotel.save();

      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error in creating hotel:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/", verifyToken, async (req, res) => {
  try {
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId,
    });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.put(
  "/:hotelId",
  verifyToken,
  upload.array("imageFiles"),
  async (req, res) => {
    try {
      const updatedHotel = req.body;
      updatedHotel.lastUpdated = new Date();

      const hotel = await Hotel.findOneAndUpdate(
        {
          _id: req.params.hotelId,
          userId: req.userId,
        },
        updatedHotel,
        { new: true }
      );

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const files = req.files;
      const updatedImageUrls = await uploadImages(files);

      hotel.imageUrls = [
        ...updatedImageUrls,
        ...(updatedHotel.imageUrls || []),
      ];

      await hotel.save();
      res.status(201).json(hotel);
    } catch (err) {
      res.status(500).json({ message: "Something went throw" });
    }
  }
);
module.exports = router;
