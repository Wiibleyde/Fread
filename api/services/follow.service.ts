import { prisma } from "../prisma";

export const followAccountDB = async (followerId: string, followedAccountId: string) => {
    return prisma.follow.upsert({
        where: {
            accountId_followedAccountId: {
                accountId: followerId,
                followedAccountId: followedAccountId,
            }
        },
        update: {},
        create: {
            accountId: followerId,
            followedAccountId: followedAccountId,
        }
    });
};

export const unfollowAccount = async (followerId: string, followedAccountId: string) => {
    return prisma.follow.delete({
        where: {
            accountId_followedAccountId: {
                accountId: followerId,
                followedAccountId: followedAccountId,
            }
        }
    });
};

export const isFollowing = async (followerId: string, followedAccountId: string) => {
    const follow = await prisma.follow.findUnique({
        where: {
            accountId_followedAccountId: {
                accountId: followerId,
                followedAccountId: followedAccountId,
            }
        }
    });
    return !!follow;
};