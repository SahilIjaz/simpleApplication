const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const otpGenerator = require("../utils/otpGenerator");
const util = require("util");
const jwt = require("jsonwebtoken");
const signInTokens = require("../utils/tokenGenerator");
const { socialChecks } = require("../utils/socialLogInChecks");
const { logInChecks } = require("../utils/logInChecks");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const bcrypt = require("bcryptjs");

exports.socialLogIn = catchAsync(async (req, res, next) => {
  const { email, role, deviceId, fcmToken } = req.body;
  if (!email) {
    return next(new appError("Provide your email", 400));
  }
  if (!role) {
    return next(new appError("Select your account type", 400));
  }

  let user = await User.findOne({ email: email });
  if (!user) {
    user = await User.create({
      ...JSON.parse(JSON.stringify(req.body)),
      email,
      isVerified: true,
      role,
      password: "default1234",
    });
  }
  user.isActive = true;
  await user.save();
  const act = socialChecks(user);

  const { accessToken, refreshToken } = await signInTokens(user._id);

  const new_token = await Token.create({
    accessToken,
    refreshToken,
    deviceId,
    fcmToken,
    person: user._id,
  });

  console.log("NEW TOKEN IS : ", new_token);
  if (!new_token) {
    return next(new appError("New token was not created.", 400));
  }
  res.status(200).json({
    message: `Respected ${user.role} have loggedIn successfully.`,
    status: 200,
    accessToken,
    refreshToken,
    act,
    user,
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  let user;
  const { email, role, fcmToken, deviceId, password, confirmPassword } =
    req.body;

  if (!(email || role || fcmToken || deviceId || password || confirmPassword)) {
    return next(
      new appError(
        "Any of these email, role, fcmToken, deviceId, password, and confirmPassword is missing.",
        400
      )
    );
  }
  user = await User.findOne({ email: email });
  if (user) {
    return next(new appError("User with this email already exists.", 400));
  }

  user = await User.create({
    email,
    role,
    password,
    confirmPassword,
  });

  if (!user) {
    return next(new appError("Requested user was not created.", 400));
  }
  const otp = await otpGenerator(user);
  console.log("OTP IS : ", otp);
  user.otpExpiration = Date.now() + 1 * 60 * 1000;
  user.otp = otp;
  user.isActive = true;
  await user.save();

  const newToken = await Token.create({
    deviceId,
    fcmToken,
    person: user._id,
  });
  if (!newToken) {
    return next(new appError("Token was not generator.", 400));
  }

  const act = logInChecks(user);
  res.status(200).json({
    message: `Respected ${user.role} OTP sent at your email address.`,
    status: 200,
    act,
    user,
  });
});

exports.otpVerification = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!(email || otp)) {
    return next(new appError("Provide both email and otp.", 400));
  }

  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    return next(new appError("Requested user not found.", 404));
  }

  if (user.otpExpiration < Date.now()) {
    return next(new appError("Otp expired, request for new one.", 400));
  }

  if (user.otp !== otp) {
    return next(new appError("Plz! provide valid otp.", 400));
  }

  user.otpExpiration = undefined;
  user.otp = undefined;
  user.isVerified = true;
  await user.save();

  const { accessToken, refreshToken } = await signInTokens(user._id);

  const token = await Token.findOne({
    person: user,
  });

  if (!token) {
    return next(new appError("The token for a specific user does not exist."));
  }

  token.accessToken = accessToken;
  token.refreshToken = refreshToken;
  await token.save();

  const act = logInChecks(user);
  res.status(200).json({
    message: `Requested ${user.role} your email has been verified successfully.`,
    status: 200,
    accessToken,
    refreshToken,
    act,
    user,
  });
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new appError("Provide email.", 400));
  }

  const user = await User.findOne({
    email,
  });
  if (!user) {
    return next(new appError("Requested user not found.", 404));
  }

  if (user.isVerified === true) {
    return next(new appError("Your email is already verified.", 400));
  }

  if (user.otpExpiration > Date.now()) {
    return next(new appError("Kindly wait for 60 seconds.", 400));
  }

  const otp = await otpGenerator(user);
  console.log("THE OTP OF USER IS : ", otp);

  user.otp = otp;
  user.otpExpiration = Date.now() + 1 * 60 * 1000;
  await user.save();

  const act = logInChecks(user);

  res.status(200).json({
    message: "OTP sent at your email address successfully.",
    status: 200,
    act,
    user,
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  console.log("IN THE LOGIN CONTROLLER");
  const { email, password, deviceId, fcmToken } = req.body;
  console.log("BEFORE FINDING OUT THE USER");
  const user = await User.findOne({ email }).select("+password");
  console.log("USER FOUND SUCCESSFULLY.");
  if (!user) {
    return next(new appError("Requested user was not found.", 404));
  }

  if (user.isBlocked === true) {
    return next(new appError("You have been blocked by admin.", 400));
  }
  const passwordCorrect = await user.checkPassword(password, user.password);
  if (!passwordCorrect) {
    return next(new appError("Your password is in correct", 404));
  }

  const { accessToken, refreshToken } = await signInTokens(user._id);

  const token = await Token.findOne({
    person: user,
  });
  if (!token) {
    const newToken = await Token.create({
      deviceId,
      fcmToken,
      person: user._id,
      accessToken,
      refreshToken,
    });

    if (!newToken) {
      return next(new appError("New token was not created.", 400));
    }
    console.log("NEWLY GENERATED TOKEN IS : ", newToken);
  }

  token.fcmToken = fcmToken;
  token.deviceId = deviceId;
  token.accessToken = accessToken;
  token.refreshToken = refreshToken;
  await token.save();

  const act = logInChecks(user);

  res.status(200).json({
    message: `${user.role} loggedIn successfully.`,
    status: 200,
    accessToken,
    refreshToken,
    act,
    user,
  });
});

exports.logOut = catchAsync(async (req, res, next) => {
  const { deviceId } = req.body;
  const token = await Token.findOneAndDelete({
    $and: [{ deviceId: deviceId }, { person: req.user }],
  });

  if (!token) {
    return next(new appError("Requested user ws not logged out.", 400));
  }

  req.user.isActive = false;
  await req.user.save();

  res.status(200).json({
    message: "You have successfully logged out of your account.",
    status: 200,
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  console.log("BEFORE PASSWORD CHECK");
  const user = await User.findById(req.user._id).select("+password");
  console.log("AFTER PASSWORD CHECK");
  if (!user) {
    return next(new appError("Requested user not found.", 404));
  }
  const passwordCorrect = await user.checkPassword(password, user.password);
  if (!passwordCorrect) {
    return next(new appError("Your password is in correct", 404));
  }
  console.log("before otp expiration");
  if (user.otpExpiration > Date.now()) {
    return next(new appError("Wait for 60 seconds.", 400));
  }
  console.log("before otp generatuion");
  const otp = await otpGenerator(user);
  user.otp = otp;
  user.otpExpiration = Date.now() + 1 * 60 * 1000;
  await user.save();
  console.log("before sending the respnse");
  console.log("THE USER IS : ", user);
  console.log("THE USER IS : ", user.otp);
  res.status(200).json({
    message: "OTP sent at your email address for deleting account.",
    status: 200,
    user,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (req.user.otpExpiration < Date.now()) {
    return next(new appError("OTP expired, request for new one.", 400));
  }
  console.log("THE OTP OD+F THE USER IS : ", req.user.otp);

  if (req.user.otp !== otp) {
    return next(new appError("OTP is not valid.", 400));
  }

  if (req.user.otp === otp) {
    req.user.isDeleted = true;
    await req.user.save();
  }

  res.status(201).json({
    message: "Your account has been deleted.",
    status: 201,
    user: req.user,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("Requested user was not found.", 404));
  }

  if (user.otpExpiration > Date.now()) {
    return next(new appError("Wait for 60 seconds.", 400));
  }

  const otp = await otpGenerator(user);
  user.otp = otp;
  user.otpExpiration = Date.now() + 1 * 60 * 1000;
  await user.save();

  res.status(200).json({
    message: "OTP sent for password change.",
    status: 200,
    user,
  });
});

exports.forgotPasswordOtpVerification = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("Requested user was not found.", 404));
  }

  if (user.otpExpiration < Date.now()) {
    return next(new appError("OTP expired, request for new one.", 400));
  }

  if (user.otp !== otp) {
    return next(new appError("Provide valid email.", 400));
  }

  if (user.otp === otp) {
    user.passwordResetPermission = true;
    await user.save();
  }

  res.status(200).json({
    message: "Permission granted for new password.",
    status: 200,
    user,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!(email || password || confirmPassword)) {
    return next(
      new appError(
        "Provide all required data email, password, confirm password.",
        400
      )
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("Requested user was not found.", 404));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetPermission = false;
  await user.save();

  res.status(200).json({
    message: "Password updated successfully.",
    status: 200,
    user,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { email, newPassword, currentPassword, confirmPassword } = req.body;

  if (!(email || newPassword || currentPassword || confirmPassword)) {
    return next(
      new appError(
        "Provide all required data email, current password, confirm password and new password.",
        400
      )
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new appError("Requested user was not found.", 404));
  }

  const passwordCorrect = await user.checkPassword(
    currentPassword,
    user.password
  );
  if (!passwordCorrect) {
    return next(new appError("Your password is in correct", 404));
  }

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  res.status(200).json({
    message: "Password changed successfully.",
    status: 200,
    user,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  console.log(req.headers.authorization);
  if (!req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization;
    if (!token) {
      return next(new appError("Log-in in order to get Access!", 401));
    }

    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    console.log("DEcode TOKEN IS : ", decoded);
    console.log("DEcode TOKEN IS : ", decoded.id);
    const freshUser = await User.findById(decoded.id);
    console.log("FRESH TOKEN IS : ", freshUser);
    if (!freshUser) {
      return next(new appError("This user no longer exists.", 401));
    }

    req.user = freshUser;
    next();
  } else {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return next(new appError("Log-in in order to get Access!", 401));
      }
      const decoded = await util.promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      console.log("DEcode TOKEN IS : ", decoded.id);
      const freshUser = await User.findById(decoded.id);
      console.log("FRESH TOKEN IS : ", freshUser);

      if (!freshUser) {
        return next(new appError("This user no longer exists.", 401));
      }
      req.user = freshUser;

      next();
    }
  }
});
