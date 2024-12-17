const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

exports.generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {});
};

signToken = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new appError("User not found", 404);
    }
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    console.log("-----------------------------------");
    console.log("-----------------------------------");
    console.log("-----------------------------------");
    console.log("-----------------------------------");
    console.log("-----------------------------------");
    console.log("ACCESS TOKEN IS : ", accessToken);
    console.log("REFRESH TOKEN IS : ", refreshToken);
    return { accessToken, refreshToken };
  } catch (err) {
    console.log(err.message);
    throw new appError("Could not generate access and refresh tokens", 500);
  }
};

module.exports = signToken;
