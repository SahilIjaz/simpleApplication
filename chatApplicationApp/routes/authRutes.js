const authControllers = require("../controllers/authControllers");
const express = require("express");
const router = express.Router();

router.route("/social-log-in").post(authControllers.socialLogIn);

router.route("/sign-up").post(authControllers.signUp);

router.route("/otp-verification").post(authControllers.otpVerification);

router.route("/resend-otp").post(authControllers.resendOtp);

router.route("/log-in").post(authControllers.logIn);

router.route("/forgot-password").post(authControllers.forgotPassword);

router
  .route("/forgot-password-verification")
  .post(authControllers.forgotPasswordOtpVerification);

router.route("/reset-password").patch(authControllers.resetPassword);

router
  .route("/change-password")
  .patch(authControllers.protect, authControllers.changePassword);
router
  .route("/delete-user")
  .post(authControllers.protect, authControllers.deleteAccount);

router
  .route("/delete-me")
  .post(authControllers.protect, authControllers.deleteUser);

router.route("/log-out").post(authControllers.protect, authControllers.logOut);

module.exports = router;
