import AppError from "./AppError";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", data?: Record<string, unknown>) {
    super(message, 401, data);
  }
}

export default UnauthorizedError;