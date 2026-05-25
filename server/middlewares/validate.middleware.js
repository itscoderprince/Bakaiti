import AppError from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    // If Zod validation fails, extract the error messages
    const message = err.errors.map((e) => e.message).join(", ");
    next(new AppError(400, message));
  }
};
