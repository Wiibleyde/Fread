import { prisma } from "../prisma";

export const createPostDB = (content: string, authorId: string, isPrivate: boolean) => {
    return prisma.post.create({
        data: {
            content,
            accountId: authorId,
            private: isPrivate
        }
    });
}

export const getPostsByAccountId = (accountId: string) => {
    return prisma.post.findMany({
        where: {
            accountId
        },
        orderBy: {
            creationDate: "desc"
        },
        include: {
            _count: {
                select: {
                    likes: true,
                    replies: true
                }
            }
        }
    });
}

export const getPostById = (postId: string) => {
    return prisma.post.findUnique({
        where: {
            id: postId
        }
    });
}

export const deletePostByIdDb = (postId: string) => {
    return prisma.post.delete({
        where: {
            id: postId
        }
    });
}

export const editPostById = (postId: string, content: string, isPrivate: boolean) => {
    return prisma.post.update({
        where: {
            id: postId
        },
        data: {
            content,
            private: isPrivate
        }
    });
}

export const createReplyDB = async (basePostId: string, content: string, authorId: string, isPrivate: boolean) => {
    return prisma.$transaction(async (tx) => {
        const replyPost = await tx.post.create({
            data: {
                content,
                accountId: authorId,
                private: isPrivate
            }
        });

        await tx.reply.create({
            data: {
                basePostId,
                replyPostId: replyPost.id
            }
        });

        return replyPost;
    });
}

export const getRepliesForPost = (basePostId: string) => {
    return prisma.reply.findMany({
        where: { basePostId },
        include: {
            replyPost: {
            }
        },
        orderBy: {
            replyPost: { creationDate: "desc" }
        }
    });
}

export const getPostLikesCount = async (postId: string) => {
    const count = await prisma.like.count({
        where: { postId }
    });
    return count;
}

export const getPostRepliesCount = async (postId: string) => {
    const count = await prisma.reply.count({
        where: { basePostId: postId }
    });
    return count;
}

export const getPostsCountByAccountId = async (accountId: string) => {
    const count = await prisma.post.count({
        where: { accountId }
    });
    return count;
}