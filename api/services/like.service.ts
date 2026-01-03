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

export const isPostLikedByAccountDB = async (accountId: string, postId: string): Promise<boolean> => {
    const like = await prisma.like.findUnique({
        where: {
            accountId_postId: {
                accountId,
                postId,
            }
        }
    });
    return !!like;
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