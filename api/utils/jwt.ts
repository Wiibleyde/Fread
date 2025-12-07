import jwt from "jsonwebtoken";
import type { Account } from "../generated/prisma/client";
import type { JWTPayload } from "../models/jwt.model";

export const generateJWT = (user: Account): string => {
    const payload = {
        id: user.id,
        username: user.username,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
    });
    return token;
};

export const verifyJWT = (token: string): JWTPayload | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (typeof decoded === "string") {
            return null;
        }
        return decoded as JWTPayload;
    } catch (_err) {
        return null;
    }
};
