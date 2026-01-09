import type { Request } from "express";
import BadRequestError from "../errors/badrequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { deleteAccount, getAccountByIdDB } from "../services/account.service";
import { getPostsByAccountId } from "../services/post.service";

class AccountController {
    getProfile = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        const account = await getAccountByIdDB(id);

        return { account, retrieved: true };
    };

    deleteAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required", { deleted: false });
        }

        if (account.id !== id) {
            throw new ForbiddenError("Cannot delete another user's account", { deleted: false });
        }

        try {
            await deleteAccount(account.id);
            return { deleted: true, message: "Account deleted successfully" };
        } catch (error) {
            console.error("Error deleting account:", error);
            throw new InternalError("Failed to delete account", { deleted: false });
        }
    };

    getPosts = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        try {
            const posts = await getPostsByAccountId(id);
            return { posts, retrieved: true };
        } catch (error) {
            console.error("Error retrieving posts:", error);
            throw new InternalError("Failed to retrieve posts", { retrieved: false });
        }
    }
}

export default AccountController;
