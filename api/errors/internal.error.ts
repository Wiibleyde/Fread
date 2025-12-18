import AppError from "./AppError";


class InternalError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500);
    }
}

export default InternalError;