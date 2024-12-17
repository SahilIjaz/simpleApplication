const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const User = require("../models/userModel");
const { logInChecks } = require("../utils/logInChecks");
const signInTokens = require("../utils/tokenGenerator");

exports.profileCreation = catchAsync(async (req, res, next) => {
  const { fullName, bio } = req.body;

  if (req.user.role === "user") {
    const data = { fullName, bio };
    console.log("THE DAT IS : ", data);
    console.log("THE USER IS : ", req.user);
    const USER = await User.findOne(req.user);
    console.log("THE USER I S: ", USER);
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new appError("Profile was not created for requested user.", 400)
      );
    }

    user.isProfileCompleted = true;
    user.isActive = true;
    await user.save();

    const { accessToken, refreshToken } = await signInTokens(user._id);
    const act = logInChecks(user);

    return res.status(200).json({
      message: `Dear ${user.role} your profile has been completed successfully.`,
      status: 200,
      accessToken,
      refreshToken,
      act,
      user,
    });
  }
  if (req.user.role === "admin") {
    const data = { fullName, bio };
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new appError("Profile was not created for requested user.", 400)
      );
    }

    user.isProfileCompleted = true;
    user.isActive = true;
    await user.save();

    const { accessToken, refreshToken } = await signInTokens(user);
    const act = logInChecks(user);

    return res.status(200).json({
      message: `Dear ${user.role} your profile has been completed successfully.`,
      status: 200,
      accessToken,
      refreshToken,
      act,
      user,
    });
  }
});

exports.profileUpdate = catchAsync(async (req, res, next) => {
  const { fullName, bio } = req.body;

  if (req.user.role === "user") {
    const data = { fullName, bio };
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new appError("Profile was not updated for requested user.", 400)
      );
    }

    user.isProfileCompleted = true;
    user.isActive = true;
    await user.save();

    const { accessToken, refreshToken } = await signInTokens(user._id);
    const act = logInChecks(user);

    return res.status(200).json({
      message: `Dear ${user.role} your profile has been updated successfully.`,
      status: 200,
      accessToken,
      refreshToken,
      act,
      user,
    });
  }
  if (req.user.role === "admin") {
    const data = { fullName, bio };
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(
        new appError("Profile was not updated for requested user.", 400)
      );
    }
    console.log("USER");
    user.isProfileCompleted = true;
    user.isActive = true;
    await user.save();

    const { accessToken, refreshToken } = await signInTokens(user);
    const act = logInChecks(user);

    return res.status(200).json({
      message: `Dear ${user.role} your profile has been updated successfully.`,
      status: 200,
      accessToken,
      refreshToken,
      act,
      user,
    });
  }
});

exports.notificationAccess = catchAsync(async (req, res, next) => {
  console.log("THE USER IS : ", req.user);
  let user;
  if (req.user.isNotification === false) {
    req.user.isNotification = true;
    await req.user.save();
    user = req.user;
    return res.status(200).json({
      message: "Your notifications turned on.",
      status: 200,
      user,
    });
  }
  req.user.isNotification = false;
  await req.user.save();
  user = req.user;
  return res.status(200).json({
    message: "Your notifications turned off.",
    status: 200,
    user,
  });
});
