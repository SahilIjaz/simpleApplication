class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = `${statusCode}`.startsWith("4") ? "fail" : "Error!";
    this.isOptional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = appError;
