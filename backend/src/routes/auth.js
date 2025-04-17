const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const verifyToken = require("../middleware/auth.js");
const router = express.Router();

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Invalid email format"),
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Set token as HTTP-only cookie
      res.cookie("auth_token", token, {
        httpOnly: true, // Protects against XSS attacks (client can't access cookies directly)
        secure: true, // Ensure the cookie is sent only over HTTPS
        sameSite: "None", // Required for cross-origin requests
        maxAge: 86400000, // 1 day
      });

      return res.status(200).json({ message: "Login successful", user });
    } catch (error) {
      console.error("Error in /login:", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  }
);

router.get("/validate-token", verifyToken, (req, res) => {
  res.status(200).send({ userId: req.userId });
});

router.post("/logout", (req, res) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
});
module.exports = router;
