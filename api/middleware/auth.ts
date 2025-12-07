import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.model";
import { authenticateUser } from "../services/auth.service";
import { verifyJWT } from "../utils/jwt";

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const payload = verifyJWT(token);

        if (!payload) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const user = await authenticateUser(payload.id);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (_err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
