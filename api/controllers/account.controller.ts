import type { Request } from "express";
import BadRequestError from "../errors/badrequest.error";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { deleteAccount, getAccountByIdDB } from "../services/account.service";
import { getPostsByAccountId } from "../services/post.service";
import { Logger } from "../utils/logger";

const logger = Logger.for(import.meta.url);


class AccountController {

    getProfile = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            logger.warn("Get profile called without ID");
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        logger.info("Retrieving profile");
        const account = await getAccountByIdDB(id);

        return { account, retrieved: true };
    };

    deleteAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            logger.warn("Delete account called without ID");
            throw new BadRequestError("ID parameter is required", { deleted: false });
        }

        if (account.id !== id) {
            logger.warn("Forbidden account deletion attempt");
            throw new ForbiddenError("Cannot delete another user's account", { deleted: false });
        }

        try {
            logger.info("Deleting account");
            await deleteAccount(account.id);

            return { deleted: true, message: "Account deleted successfully" };
        } catch (error) {
            logger.error("Error deleting account");
            throw new InternalError("Failed to delete account", { deleted: false });
        }
    };

    getPosts = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            logger.warn("Get posts called without ID");
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        try {
            logger.info("Retrieving posts for account");
            const posts = await getPostsByAccountId(id);
            return { posts, retrieved: true };
        } catch (error) {
            logger.error("Error retrieving posts");
            throw new InternalError("Failed to retrieve posts", { retrieved: false });
        }
    }
}

export default AccountController;
