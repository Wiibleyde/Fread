import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { followAccountDB, unfollowAccount } from "../services/follow.service";

class FollowController {
    followAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToFollow = req.params.id;

        if (!idToFollow) {
            throw new BadRequestError("ID parameter is required");
        }

        if (!account) {
            throw new UnauthorizedError();
        }

        if (account.id === idToFollow) {
            throw new BadRequestError("Cannot follow yourself");
        }

        try {
            await followAccountDB(account.id, idToFollow);
            return { followed: true, message: `Successfully followed account with ID: ${idToFollow}` };
        } catch (_error) {
            throw new InternalError();
        }
    };

    unfollowAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToUnfollow = req.params.id;

        if (!idToUnfollow) {
            throw new BadRequestError("ID parameter is required");
        }

        if (!account) {
            throw new UnauthorizedError();
        }

        if (account.id === idToUnfollow) {
            throw new BadRequestError("Cannot unfollow yourself");
        }

        try {
            await unfollowAccount(account.id, idToUnfollow);
            return { unfollowed: true, message: `Successfully unfollowed account with ID: ${idToUnfollow}` };
        } catch (_error) {
            throw new InternalError();
        }
    };
}

export default FollowController;
