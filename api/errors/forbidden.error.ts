import AppError from "./AppError";

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", data?: Record<string, unknown>) {
    super(message, 403, data);
  }
}

export default ForbiddenError;