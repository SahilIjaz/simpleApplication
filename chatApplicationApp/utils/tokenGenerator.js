// const jwt = require("jsonwebtoken");
// const createToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.EXPIRES_IN,
//   });
// };

// module.exports = createToken;

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
// const appError = require("./appError");
// const catchAsync = require("./catchAsync");

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
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    //expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
  });
};

console.log("SECRET KEY IS : ", process.env.JWT_SECRET);
signToken = async (id) => {
  try {
    //console.log(ID BEING PASSED TO FIND BY ID in signToken: ${id})
    const user = await User.findById(id);
    //console.log(Query executed: User.findById(${id}));
    if (!user) {
      throw new appError("User not found", 404);
    }
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    //await user.save({ validateBeforeSave: false });
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
