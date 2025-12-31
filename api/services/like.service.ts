import { prisma } from "../prisma";

export const likePostDB = async (accountId: string, postId: string): Promise<void> => {
    await prisma.like.upsert({
        where: {
            accountId_postId: {
                accountId,
                postId,
            }
        },
        update: {},
        create: {
            accountId,
            postId,
        }
    });
};


export const unlikePostDB = async (accountId: string, postId: string): Promise<void> => {
    await prisma.like.delete({
        where: {
            accountId_postId: {
                accountId,
                postId,
            }
        }
    });
};