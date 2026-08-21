import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator validation results.
 * If errors exist, returns 400 Bad Request with consistent JSON structure.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
