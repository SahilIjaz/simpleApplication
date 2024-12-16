const userControllers = require("../controllers/userControllers");
const authControllers = require("../controllers/authControllers");
const express = require("express");
const router = express.Router();

router
  .route("/profile-completion")
  .post(authControllers.protect, userControllers.profileCreation);

router
  .route("/profile-update")
  .patch(authControllers.protect, userControllers.profileUpdate);

router
  .route("/notification-access")
  .get(authControllers.protect, userControllers.notificationAccess);
module.exports = router;
