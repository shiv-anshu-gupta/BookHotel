const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post(
  "/register",
  [
    check("email").isEmail().withMessage("Invalid email format"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    check("firstname").notEmpty().withMessage("First name is required"),
    check("lastname").notEmpty().withMessage("Last name is required"),
  ],
  async (req, res) => {
    console.log("Received data:", req.body);

    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstname, lastname } = req.body;

      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User({ email, password, firstname, lastname });
      await user.save();

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 86400000,
      });

      return res
        .status(201)
        .json({ message: "User registered successfully", user });
    } catch (error) {
      console.error("Error in /register:", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);

module.exports = router;
