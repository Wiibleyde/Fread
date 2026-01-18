import type { NextFunction, Request, RequestHandler, Response } from "express";
import { authenticateUser } from "../services/auth.service";
import { verifyJWT } from "../utils/jwt";
import type { AuthenticatedRequest } from "../models/auth.model";
import { Logger } from "../utils/logger";
import UnauthorizedError from "../errors/unauthorized.error";

const log = Logger.for(import.meta.url);

const getTokenFromAuthorizationHeader = (req: Request): string | null => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const [scheme, token] = authHeader.split(" ");

    if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
        return null;
    }

    return token;
};

export const authMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = getTokenFromAuthorizationHeader(req);

        if (!token) {
            log.warn("Auth failed: no token provided in Authorization header");
            return next(new UnauthorizedError("Unauthorized"));
        }

        const payload = verifyJWT(token);

        if (!payload) {
            log.warn("Auth failed: invalid token");
            return next(new UnauthorizedError("Unauthorized"));
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            log.warn("Auth failed: user not found for token subject");
            return next(new UnauthorizedError("Unauthorized"));
        }

        (req as AuthenticatedRequest).account = account;
        log.debug("Authenticated request");
        next();
    } catch (_err) {
        log.error("Auth middleware error");
        return next(new UnauthorizedError("Unauthorized"));
    }
};
