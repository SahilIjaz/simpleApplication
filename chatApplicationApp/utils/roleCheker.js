exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You are not authorized to perform this action.",
        status: 403,
      });
    }
    next();
  };
};
