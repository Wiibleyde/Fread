import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { isPostLikedByAccountDB, likePostDB, unlikePostDB } from "../services/like.service";

class LikeController {
    likePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id;

        if (!postId) {
            throw new BadRequestError("ID parameter is required", { liked: false });
        }

        if (!account) {
            throw new UnauthorizedError("Unauthorized", { liked: false });
        }

        try {
            await likePostDB(account.id, postId);
            return { liked: true, message: `Successfully liked post with ID: ${postId}` };
        } catch (_error) {
            throw new InternalError("Internal server error", { liked: false });
        }
    };

    unlikePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id;

        if (!postId) {
            throw new BadRequestError("ID parameter is required", { unliked: false });
        }

        if (!account) {
            throw new UnauthorizedError("Unauthorized", { unliked: false });
        }

        const isLiked = await isPostLikedByAccountDB(account.id, postId);

        if (!isLiked) {
            throw new BadRequestError("Post is not liked by the account", { unliked: false });
        }

        try {
            await unlikePostDB(account.id, postId);
            return { unliked: true, message: `Successfully unliked post with ID: ${postId}` };
        } catch (_error) {
            console.error(_error);
            throw new InternalError("Internal server error", { unliked: false });
        }
    };
}

export default LikeController;