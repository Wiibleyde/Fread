import type { Request } from "express";
import ForbiddenError from "../errors/forbidden.error";
import InternalError from "../errors/internal.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import type { AccountEditBody } from "../schemas/account";
import { deleteAccount, editAccountDb, getAccountByIdDB } from "../services/account.service";
import { getPostLikesCount, getPostRepliesCount, getPostsByAccountId, getPostsCountByAccountId } from "../services/post.service";
import { Logger } from "../utils/logger";
import { getFollowersCount, getFollowingCount } from "../services/follow.service";

const logger = Logger.for(import.meta.url);

class AccountController {

    getProfile = async (req: Request) => {
        const id = req.params.id!;

        logger.debug("Retrieving profile");
        const account = await getAccountByIdDB(id);
        if (!account) {
            return { account: null, retrieved: false };
        }

        return {
            retrieved: !!account,
            account: {
                ...account,
                postsCount: await getPostsCountByAccountId(account.id),
                followingCount: await getFollowingCount(account.id),
                followersCount: await getFollowersCount(account.id)
            }
        };
    };

    deleteAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id;

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
        const id = req.params.id!;

        try {
            logger.debug("Retrieving posts for account");
            const posts = await getPostsByAccountId(id);
            const mappedPosts = await Promise.all(posts.map(async post => {
                return {
                    ...post,
                    likesCount: await getPostLikesCount(post.id),
                    repliesCount: await getPostRepliesCount(post.id)
                };
            }));

            return { posts: mappedPosts, retrieved: posts.length > 0 };
        } catch (error) {
            logger.error("Error retrieving posts");
            throw new InternalError("Failed to retrieve posts", { retrieved: false });
        }
    }

    editAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;

        const { displayName, description, isPrivate } = req.body as AccountEditBody;

        try {
            logger.info("Editing account");
            await editAccountDb(account.id, { displayName, description, private: isPrivate });

            return { edited: true, message: "Account edited successfully" };
        } catch (error) {
            logger.error("Error editing account");
            throw new InternalError("Failed to edit account", { edited: false });
        }
    }
}

export default AccountController;
