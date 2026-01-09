import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError";
import { Logger } from "../utils/logger";

const log = Logger.for(import.meta.url);

export function errorMiddleware(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.data ?? {}),
        });
    }

    // Stack trace uniquement en niveau debug pour éviter de logguer trop d'infos sensibles
    if (log.minLevel === "debug") {
        log.error("Unhandled error (debug)", err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err);
    } else {
        log.error("Unhandled error");
    }
    res.status(500).json({ error: "Internal server error" });
}
