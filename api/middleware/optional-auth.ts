import type { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyJWT } from "../utils/jwt";
import { authenticateUser } from "../services/auth.service";
import type { AuthenticatedRequest } from "../models/auth.model";


export const optionalAuthMiddleware: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const token = req.body?.token
        
        if (!token) {
            return next();
        }

        const payload = verifyJWT(token);

        if (!payload) {
            return next();
        }

        const account = await authenticateUser(payload.id);

        if (!account) {
            return next();
        }

        (req as AuthenticatedRequest).account = account || undefined;
        next();
        
    } catch (_err) {
        console.error("Optional auth middleware error:", _err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}