import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { getAccountByIdDB } from "../services/account.service";
import { followAccountDB, unfollowAccount } from "../services/follow.service";
import { Logger } from "../utils/logger";

const logger = Logger.for(import.meta.url);


class FollowController {

    followAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToFollow = req.params.id!;

        if (account.id === idToFollow) {
            logger.warn("Attempted to follow oneself");
            throw new BadRequestError("Cannot follow yourself", { followed: false });
        }

        const targetAccount = await getAccountByIdDB(idToFollow);
        if (!targetAccount) {
            logger.warn("Attempted to follow non-existent account");
            throw new NotFoundError("Account to follow not found", { followed: false });
        }

        try {
            logger.info("Following account");
            await followAccountDB(account.id, idToFollow);
            return {
                followed: true,
                message: `Successfully followed account with ID: ${idToFollow}`,
            };
        } catch (_error) {
            logger.error("Error following account");
            throw new InternalError("Failed to follow account", { followed: false });
        }
    };

    unfollowAccount = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const idToUnfollow = req.params.id!;

        if (account.id === idToUnfollow) {
            logger.warn("Attempted to unfollow oneself");
            throw new BadRequestError("Cannot unfollow yourself", { unfollowed: false });
        }

        try {
            logger.info("Unfollowing account");
            await unfollowAccount(account.id, idToUnfollow);
            return {
                unfollowed: true,
                message: `Successfully unfollowed account with ID: ${idToUnfollow}`,
            };
        } catch (_error) {
            logger.error("Error unfollowing account");
            throw new InternalError("Failed to unfollow account", { unfollowed: false });
        }
    };
}

export default FollowController;
