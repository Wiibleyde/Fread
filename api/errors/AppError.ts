class AppError extends Error {
    constructor(
        public override message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
    }
}

export default AppError;