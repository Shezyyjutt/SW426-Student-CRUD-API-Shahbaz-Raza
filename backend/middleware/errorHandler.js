import mongoose from "mongoose";

function handleMongooseError(err) {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return {
      statusCode: 400,
      body: {
        success: false,
        message: "Validation failed",
        errors: messages,
      },
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return {
      statusCode: 409,
      body: {
        success: false,
        message:
          field === "rollNo"
            ? "A student with this roll number already exists"
            : "Duplicate value violates unique constraint",
      },
    };
  }

  return null;
}

/**
 * Express error-handling middleware (must be registered last).
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const mongooseMapped = handleMongooseError(err);
  if (mongooseMapped) {
    return res.status(mongooseMapped.statusCode).json(mongooseMapped.body);
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}

/**
 * Create an operational error with HTTP status.
 */
export function createHttpError(statusCode, message, errors) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (errors) {
    error.errors = errors;
  }
  return error;
}

/**
 * Validate MongoDB ObjectId route parameter.
 */
export function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid student ID format"));
    }
    next();
  };
}

/**
 * Handle invalid JSON bodies from express.json().
 */
export function jsonSyntaxErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }
  next(err);
}

/**
 * 404 for undefined API routes.
 */
export function notFoundHandler(req, res, next) {
  next(
    createHttpError(404, `Route not found: ${req.method} ${req.originalUrl}`),
  );
}
