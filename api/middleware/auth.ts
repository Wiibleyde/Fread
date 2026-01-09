import type { NextFunction, Request, RequestHandler, Response } from "express";
import { authenticateUser } from "../services/auth.service";
import { verifyJWT } from "../utils/jwt";
import type { AuthenticatedRequest } from "../models/auth.model";
import { Logger } from "../utils/logger";

const log = Logger.for(import.meta.url);

export const authMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { token } = req.body;

        if (!token) {
            log.warn("Auth failed: no token provided");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const payload = verifyJWT(token);

        if (!payload) {
            log.warn("Auth failed: invalid token");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            log.warn("Auth failed: user not found for token subject");
            return res.status(401).json({ error: "Unauthorized" });
        }

        (req as AuthenticatedRequest).account = account;
        log.info("Authenticated request");
        next();
    } catch (_err) {
        log.error("Auth middleware error");
        return res.status(401).json({ error: "Unauthorized" });
    }
};
