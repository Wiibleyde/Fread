import { prisma } from "../prisma";

export const followAccountDB = async (
	followerId: string,
	followedAccountId: string,
) => {
	return prisma.follow.upsert({
		where: {
			accountId_followedAccountId: {
				accountId: followerId,
				followedAccountId: followedAccountId,
			},
		},
		update: {},
		create: {
			accountId: followerId,
			followedAccountId: followedAccountId,
		},
	});
};

export const unfollowAccount = async (
	followerId: string,
	followedAccountId: string,
) => {
	return prisma.follow.delete({
		where: {
			accountId_followedAccountId: {
				accountId: followerId,
				followedAccountId: followedAccountId,
			},
		},
	});
};

export const isFollowing = async (
	followerId: string,
	followedAccountId: string,
) => {
	const follow = await prisma.follow.findUnique({
		where: {
			accountId_followedAccountId: {
				accountId: followerId,
				followedAccountId: followedAccountId,
			},
		},
	});
	return !!follow;
};

export const getFollowersCount = async (accountId: string) => {
	return prisma.follow.count({
		where: {
			followedAccountId: accountId,
		},
	});
};

export const getFollowingCount = async (accountId: string) => {
	return prisma.follow.count({
		where: {
			accountId: accountId,
		},
	});
};

export const getFollowersByAccountId = async (accountId: string) => {
	return prisma.follow.findMany({
		where: {
			followedAccountId: accountId,
		},
		include: {
			account: {
				select: {
					id: true,
					username: true,
					displayName: true,
					profilePicture: {
						select: {
							id: true,
							fileName: true,
						},
					},
				},
			},
		},
	});
};

export const getFollowingByAccountId = async (accountId: string) => {
	return prisma.follow.findMany({
		where: {
			accountId: accountId,
		},
		include: {
			followedAccount: {
				select: {
					id: true,
					username: true,
					displayName: true,
					profilePicture: {
						select: {
							id: true,
							fileName: true,
						},
					},
				},
			},
		},
	});
};

export const getFollowingIds = async (accountId: string) => {
	const follows = await prisma.follow.findMany({
		where: {
			accountId: accountId,
		},
		select: {
			followedAccountId: true,
		},
	});
	return follows.map((follow) => follow.followedAccountId);
};
