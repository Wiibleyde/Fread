import type { Request } from "express";
import type { Prisma } from "../generated/prisma/client";

export type AccountProfile = Prisma.AccountGetPayload<{
    select: {
        id: true;
        username: true;
        displayName: true;
        description: true;
        private: true;
        createdAt: true;
        profilePicture: {
            select: {
                id: true;
                fileName: true;
            };
        };
    };
}>;

export interface AuthenticatedRequest extends Request {
    account: AccountProfile;
}

export interface PrivateResourceRequest extends Request {
    account?: AccountProfile;
}