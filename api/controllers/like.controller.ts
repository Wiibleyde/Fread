import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { likePostDB, unlikePostDB } from "../services/like.service";

class LikeController {
    likePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id;

        if (!postId) {
            throw new BadRequestError("ID parameter is required");
        }

        if (!account) {
            throw new UnauthorizedError();
        }

        try {
            await likePostDB(account.id, postId);
            return { liked: true, message: `Successfully liked post with ID: ${postId}` };
        } catch (_error) {
            throw new InternalError();
        }
    };

    unlikePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const postId = req.params.id;

        if (!postId) {
            throw new BadRequestError("ID parameter is required");
        }

        if (!account) {
            throw new UnauthorizedError();
        }

        try {
            await unlikePostDB(account.id, postId);
            return { unliked: true, message: `Successfully unliked post with ID: ${postId}` };
        } catch (_error) {
            throw new InternalError();
        }
    };
}

export default LikeController;