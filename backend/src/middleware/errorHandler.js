/**
 * Global error handler middleware.
 * Must be registered LAST with app.use().
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === "production";

  // Log full error in development
  if (!isProd) {
    console.error("[ERROR]", err);
  } else {
    console.error("[ERROR]", err.message);
  }

  // PostgreSQL constraint violations
  if (err.code === "23505") {
    return res.status(409).json({ message: "A record with this value already exists" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ message: "Referenced record does not exist" });
  }
  if (err.code === "23514") {
    return res.status(400).json({ message: "Value violates a database constraint" });
  }

  // Known operational errors
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  // Generic fallback — never expose stack trace in production
  res.status(500).json({
    message: isProd ? "An unexpected error occurred" : err.message,
  });
}
