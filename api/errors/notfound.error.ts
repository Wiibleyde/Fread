import AppError from "./AppError";

class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404);
    }
}

export default NotFoundError;