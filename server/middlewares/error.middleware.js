export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { statusCode: 400, message };
  }

  // Mongoose connection timeout error
  if (err.name === "MongooseError" && err.message.includes("buffering timed out")) {
    const message = "Database connection is taking too long. Please try again later.";
    error = { statusCode: 503, message };
  }

  // JWT Invalid Token
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = { statusCode: 401, message };
  }

  // JWT Expired Token
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    error = { statusCode: 401, message };
  }

  // Connection Refused Error
  if (err.code === "ECONNREFUSED") {
    const message = "Service is temporarily unavailable. Connection refused.";
    error = { statusCode: 503, message };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    // Provide stack trace only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
