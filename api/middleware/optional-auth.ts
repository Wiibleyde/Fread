import type { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyJWT } from "../utils/jwt";
import { authenticateUser } from "../services/auth.service";
import type { AuthenticatedRequest } from "../models/auth.model";
import { Logger } from "../utils/logger";

const log = Logger.for(import.meta.url);


export const optionalAuthMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.body?.token;

        if (!token) {
            log.debug("No token provided, proceeding as guest");
            return next();
        }

        const payload = verifyJWT(token);

        if (!payload) {
            log.debug("Invalid token, proceeding as guest");
            return next();
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            log.debug("No account found for token subject, proceeding as guest");
            return next();
        }

        (req as AuthenticatedRequest).account = account || undefined;
        log.info("Authenticated in optional auth middleware");
        next();
    } catch (_err) {
        log.warn("Optional auth middleware error; treating as guest");
        return next();
    }
}