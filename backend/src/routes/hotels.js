const express = require("express");
const router = express.Router();
const { param, validationResult } = require("express-validator");
const Hotel = require("../models/hotels");

// Function to construct the search query
const constructSearchQuery = (queryParams) => {
  let constructedQuery = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = { $gte: parseInt(queryParams.adultCount) };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = { $gte: parseInt(queryParams.childCount) };
  }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities
        : [queryParams.facilities],
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star) => parseInt(star))
      : [parseInt(queryParams.stars)];

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = { $lte: parseInt(queryParams.maxPrice) };
  }

  return constructedQuery;
};

// Search route
router.get("/search", async (req, res) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }
    const pageSize = 5;
    const pageNumber = parseInt(req.query.page) || 1;
    const skip = (pageNumber - 1) * pageSize;

    // Apply the search query
    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel id is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});
module.exports = router;
