import AppError from "./AppError";

class NotFoundError extends AppError {
    constructor(message = "Not found", data?: Record<string, unknown>) {
        super(message, 404, data);
    }
}

export default NotFoundError;