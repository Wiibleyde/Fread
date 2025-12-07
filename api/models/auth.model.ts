import type { Request } from "express";
import type { Account } from "../generated/prisma/client";

export interface AuthenticatedRequest extends Request {
    user?: Account;
}