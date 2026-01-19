import type { Request } from "express";
import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { getAccountByIdDB } from "../services/account.service";
import {
	followAccountDB,
	getFollowersByAccountId,
	getFollowingByAccountId,
	unfollowAccount,
} from "../services/follow.service";
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
			throw new NotFoundError("Account to follow not found", {
				followed: false,
			});
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
			throw new BadRequestError("Cannot unfollow yourself", {
				unfollowed: false,
			});
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
			throw new InternalError("Failed to unfollow account", {
				unfollowed: false,
			});
		}
	};

	getFollowers = async (req: Request) => {
		const accountId = req.params.id!;

		const targetAccount = await getAccountByIdDB(accountId);
		if (!targetAccount) {
			logger.warn("Attempted to get followers of non-existent account");
			throw new NotFoundError("Account not found");
		}

		try {
			logger.info("Getting followers");
			const followers = await getFollowersByAccountId(accountId);
			return {
				followers: followers.map((follow) => follow.account),
				count: followers.length,
			};
		} catch (_error) {
			logger.error("Error getting followers");
			throw new InternalError("Failed to get followers");
		}
	};

	getFollowed = async (req: Request) => {
		const accountId = req.params.id!;

		const targetAccount = await getAccountByIdDB(accountId);
		if (!targetAccount) {
			logger.warn("Attempted to get followed accounts of non-existent account");
			throw new NotFoundError("Account not found");
		}

		try {
			logger.info("Getting followed accounts");
			const followed = await getFollowingByAccountId(accountId);
			return {
				followed: followed.map((follow) => follow.followedAccount),
				count: followed.length,
			};
		} catch (_error) {
			logger.error("Error getting followed accounts");
			throw new InternalError("Failed to get followed accounts");
		}
	};
}

export default FollowController;
