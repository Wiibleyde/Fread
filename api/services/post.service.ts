import { prisma } from "../prisma"

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