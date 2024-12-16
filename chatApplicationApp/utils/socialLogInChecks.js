const socialChecks = (user) => {
  if (user.role === "user") {
    if (!user.isProfileCompleted) {
      return "user-profile-setup-pending";
    }
  } else if (user.role === "admin") {
    if (!user.isProfileCompleted) {
      return "Admin-profile-setup-pending";
    }
  } else {
    return "Invalid userType";
  }
  return "login-granted";
};

module.exports = { socialChecks };
