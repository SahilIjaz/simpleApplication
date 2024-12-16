const logInChecks = (user) => {
  if (!user.isVerified) {
    return "email-unverified";
  }
  if (user.role === "user") {
    if (!user.isProfileCompleted) {
      return "user-profile-setup-pending";
    }
    if (!user.isVerified) {
      return "angular-email-verification-pending";
    }
  } else if (user.role === "admin") {
    if (!user.isProfileCompleted) {
      return "Admin-profile-setup-pending";
    }
    if (!user.isVerified) {
      return "Admin-Email-verification-pending";
    }
  } else {
    return "Invalid userType";
  }
  return "login-granted";
};

module.exports = { logInChecks };
