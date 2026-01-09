import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { getAccountByIdDB } from "../services/account.service";
import { followAccountDB, unfollowAccount } from "../services/follow.service";

class FollowController {
    followAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToFollow = req.params.id;

        if (!idToFollow) {
            throw new BadRequestError("ID parameter is required", { followed: false });
        }

        if (account.id === idToFollow) {
            throw new BadRequestError("Cannot follow yourself", { followed: false });
        }

        const targetAccount = await getAccountByIdDB(idToFollow);
        if (!targetAccount) {
            throw new NotFoundError("Account to follow not found", { followed: false });
        }

        try {
            await followAccountDB(account.id, idToFollow);
            return {
                followed: true,
                message: `Successfully followed account with ID: ${idToFollow}`,
            };
        } catch (_error) {
            console.error(_error);
            throw new InternalError("Failed to follow account", { followed: false });
        }
    };

    unfollowAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToUnfollow = req.params.id;

        if (!idToUnfollow) {
            throw new BadRequestError("ID parameter is required", { unfollowed: false });
        }

        if (account.id === idToUnfollow) {
            throw new BadRequestError("Cannot unfollow yourself", { unfollowed: false });
        }

        try {
            await unfollowAccount(account.id, idToUnfollow);
            return {
                unfollowed: true,
                message: `Successfully unfollowed account with ID: ${idToUnfollow}`,
            };
        } catch (_error) {
            throw new InternalError("Failed to unfollow account", { unfollowed: false });
        }
    };
}

export default FollowController;
