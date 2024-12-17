const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new appError(message, 400);
};

const tokenExpiredError = (err) => {
  return new appError("Your jwt token has expired please login again", 400);
};

const jsonWebTokenError = (err) => {
  return new appError("Invalid Token. Please login again!!", 401);
};

const duplicateKeyError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  return new appError(
    ` Duplicate Field Value: ${value}. Please use a different value`,
    400
  );
};

const validationError = (err) => {
  const errors = Object.values(err.errors).map((value) => value.message);
  const errorMsgs = errors.join(". ");
  const msg = `Invalid input data: ${errorMsgs}`;

  return new appError(msg, 400);
};

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const prodErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      statusCode: error.statusCode,
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "fail",
      message: "Something went wrong please try again",
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Internal Server Error";
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    if (error.name === "TokenExpiredError") {
      error = tokenExpiredError(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = jsonWebTokenError(error);
    }
    if (error.code === 11000) {
      error = duplicateKeyError(error);
    }
    if (error.name === "ValidationError") {
      error = validationError(error);
    }
    if (error.name === "CastError") {
      error = handleCastError(error);
    }
    prodErrors(res, error);
  }
};
