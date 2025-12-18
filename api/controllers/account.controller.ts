import type { Request, Response } from "express";
import BadRequestError from "../errors/badrequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { deleteAccount, getAccountByIdDB } from "../services/account.service";

class AccountController {
    getProfile = async (req: Request, res: Response) => {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required");
        }

        const account = await getAccountByIdDB(id);

        res.json({ account });
    };

    deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        if (!account) {
            throw new UnauthorizedError();
        }

        if (account.id !== id) {
            throw new ForbiddenError("Cannot delete another user's account");
        }

        try {
            await deleteAccount(account.id);
            res.json({ message: "Account deleted successfully" });
        } catch (error) {
            console.error("Error deleting account:", error);
            throw new InternalError("Failed to delete account");
        }
    };
}

export default AccountController;
