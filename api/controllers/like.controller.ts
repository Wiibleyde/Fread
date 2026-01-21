import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { isPostLikedByAccountDB, likePostDB, unlikePostDB } from "../services/like.service";
import { Logger } from "../utils/logger";

const logger = Logger.here();


class LikeController {

    likePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id!;

        try {
            logger.info("Liking post");
            await likePostDB(account.id, postId);
            return { liked: true, message: `Successfully liked post with ID: ${postId}` };
        } catch (_error) {
            logger.error("Error liking post");
            throw new InternalError("Internal server error", { liked: false });
        }
    };

    unlikePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id!;

        const isLiked = await isPostLikedByAccountDB(account.id, postId);

        if (!isLiked) {
            logger.warn("Attempted to unlike a post that is not liked by this account");
            throw new BadRequestError("Post is not liked by the account", { unliked: false });
        }

        try {
            logger.info("Unliking post");
            await unlikePostDB(account.id, postId);
            return { unliked: true, message: `Successfully unliked post with ID: ${postId}` };
        } catch (_error) {
            logger.error("Error unliking post");
            throw new InternalError("Internal server error", { unliked: false });
        }
    };
}

export default LikeController;