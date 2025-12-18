import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
}
