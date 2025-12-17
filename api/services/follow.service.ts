import { prisma } from "../prisma";

export const followAccount = async (followerId: string, followedAccountId: string) => {
    return prisma.follow.create({
        data: {
            accountId: followerId,
            followedAccountId: followedAccountId,
        }
    });
};

export const unfollowAccount = async (followerId: string, followedAccountId: string) => {
    return prisma.follow.deleteMany({
        where: {
            accountId: followerId,
            followedAccountId: followedAccountId,
        }
    });
};