const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// Define Mongoose Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
// Create Mongoose Model
const User = mongoose.model("User", userSchema);

module.exports = User; // Export using CommonJS
