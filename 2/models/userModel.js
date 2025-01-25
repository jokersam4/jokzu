const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      min: 6,
    },
    avatar: {
      type: String,
      default: "https://asset.cloudinary.com/dxw3ie0en/b9fc668dc442d50cace046943244b4c3",
    },
    codepromo: {
      type: String,
      default: "empty" // Initial credit value
    }
  },
  { timestamp: true }
);

const User = model("User", userSchema);

module.exports = User;