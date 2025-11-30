import { logger } from "../config/logger.js";
import { response } from "../utils/response.js";

// Centralized error handler
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // Check both status and statusCode (some errors use statusCode)
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details || undefined;
  const code = err.code || undefined;

  if (status >= 500) {
    logger.error(message + (err.stack ? `\n${err.stack}` : ""));
  } else {
    logger.warn(message);
  }

  res.status(status).json(response.error(message, status, { ...details, code }));
}


