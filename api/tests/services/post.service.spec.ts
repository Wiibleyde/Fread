import { prisma } from "../../prisma";
import {
    createPostDB,
    getPostsByAccountId,
    getPostById,
    deletePostByIdDb,
    editPostById,
    createReplyDB,
    getRepliesForPost,
    getPostLikesCount,
    getPostRepliesCount,
    getPostsCountByAccountId,
    getFeedPosts,
} from "../../services/post.service";

const accountId = "acc_01FZACCOUNT123456789";
const otherAccountId = "acc_01FZACCOUNT987654321";
const postId = "post_01FZPOST123456789";
const replyPostId = "post_01FZREPLY123456789";
const basePostDate = new Date("2025-01-01T12:00:00.000Z");

const basePost = {
    id: postId,
    accountId,
    creationDate: basePostDate,
    content: "Hello world",
    private: false,
};

const baseReplyPost = {
    id: replyPostId,
    accountId,
    creationDate: basePostDate,
    content: "Reply content",
    private: false,
};

const baseReply = {
    id: "reply_01FZREPLYRELATION",
    basePostId: postId,
    replyPostId,
};

jest.mock("../../prisma", () => ({
    prisma: {
        post: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        reply: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
        },
        like: {
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

jest.mock("../../services/follow.service", () => ({
    getFollowingIds: jest.fn(),
}));

import { getFollowingIds } from "../../services/follow.service";

const prismaMock = prisma as unknown as {
    post: {
        create: jest.Mock;
        findMany: jest.Mock;
        findUnique: jest.Mock;
        delete: jest.Mock;
        update: jest.Mock;
        count: jest.Mock;
    };
    reply: {
        findMany: jest.Mock;
        count: jest.Mock;
        create: jest.Mock;
    };
    like: {
        count: jest.Mock;
    };
    $transaction: jest.Mock;
};

const getFollowingIdsMock = getFollowingIds as jest.MockedFunction<
    typeof getFollowingIds
>;

describe("post.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPostDB", () => {
        it("crée un post avec les bons champs", async () => {
            prismaMock.post.create.mockResolvedValue(basePost);

            const result = await createPostDB(basePost.content, accountId, false);

            expect(prismaMock.post.create).toHaveBeenCalledWith({
                data: {
                    content: basePost.content,
                    accountId,
                    private: false,
                },
            });
            expect(result).toBe(basePost);
        });
    });

    describe("getPostsByAccountId", () => {
        it("retourne uniquement les posts publics quand viewerId différent", async () => {
            const posts = [basePost];
            prismaMock.post.findMany.mockResolvedValue(posts);

            const result = await getPostsByAccountId(accountId, otherAccountId);

            expect(prismaMock.post.findMany).toHaveBeenCalledWith({
                where: {
                    accountId,
                    OR: [
                        { private: false },
                    ],
                },
                orderBy: {
                    creationDate: "desc",
                },
            });
            expect(result).toBe(posts);
        });

        it("inclut aussi les posts privés quand viewerId = accountId", async () => {
            const posts = [basePost];
            prismaMock.post.findMany.mockResolvedValue(posts);

            const result = await getPostsByAccountId(accountId, accountId);

            expect(prismaMock.post.findMany).toHaveBeenCalledWith({
                where: {
                    accountId,
                    OR: [
                        { private: false },
                        { private: true },
                    ],
                },
                orderBy: {
                    creationDate: "desc",
                },
            });
            expect(result).toBe(posts);
        });
    });

    describe("getPostById", () => {
        it("récupère un post par id", async () => {
            prismaMock.post.findUnique.mockResolvedValue(basePost);

            const result = await getPostById(postId);

            expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
                where: { id: postId },
            });
            expect(result).toBe(basePost);
        });
    });

    describe("deletePostByIdDb", () => {
        it("supprime un post par id", async () => {
            prismaMock.post.delete.mockResolvedValue(basePost);

            const result = await deletePostByIdDb(postId);

            expect(prismaMock.post.delete).toHaveBeenCalledWith({
                where: { id: postId },
            });
            expect(result).toBe(basePost);
        });
    });

    describe("editPostById", () => {
        it("met à jour le contenu et la confidentialité du post", async () => {
            const updated = { ...basePost, content: "Updated", private: true };
            prismaMock.post.update.mockResolvedValue(updated);

            const result = await editPostById(postId, updated.content, updated.private);

            expect(prismaMock.post.update).toHaveBeenCalledWith({
                where: { id: postId },
                data: {
                    content: updated.content,
                    private: updated.private,
                },
            });
            expect(result).toBe(updated);
        });
    });

    describe("createReplyDB", () => {
        it("crée un post de réponse et une entrée reply dans une transaction", async () => {
            // Simule le comportement de $transaction avec un callback tx
            prismaMock.$transaction.mockImplementation(async (cb: any) => {
                const tx = {
                    post: {
                        create: jest.fn().mockResolvedValue(baseReplyPost),
                    },
                    reply: {
                        create: jest.fn().mockResolvedValue(baseReply),
                    },
                };
                return cb(tx);
            });

            const result = await createReplyDB(postId, baseReplyPost.content, accountId, false);

            expect(prismaMock.$transaction).toHaveBeenCalled();
            expect(result).toBe(baseReplyPost);
        });
    });

    describe("getRepliesForPost", () => {
        it("récupère les réponses pour un post avec include.replyPost, ordonné par date desc", async () => {
            const replies = [
                {
                    ...baseReply,
                    replyPost: baseReplyPost,
                },
            ];
            prismaMock.reply.findMany.mockResolvedValue(replies);

            const result = await getRepliesForPost(postId);

            expect(prismaMock.reply.findMany).toHaveBeenCalledWith({
                where: { basePostId: postId },
                include: {
                    replyPost: {},
                },
                orderBy: {
                    replyPost: { creationDate: "desc" },
                },
            });
            expect(result).toBe(replies);
        });
    });

    describe("getPostLikesCount", () => {
        it("retourne le nombre de likes pour un post", async () => {
            (prismaMock.like.count as jest.Mock).mockResolvedValue(5);

            const result = await getPostLikesCount(postId);

            expect(prismaMock.like.count).toHaveBeenCalledWith({
                where: { postId },
            });
            expect(result).toBe(5);
        });
    });

    describe("getPostRepliesCount", () => {
        it("retourne le nombre de réponses pour un post", async () => {
            prismaMock.reply.count.mockResolvedValue(3);

            const result = await getPostRepliesCount(postId);

            expect(prismaMock.reply.count).toHaveBeenCalledWith({
                where: { basePostId: postId },
            });
            expect(result).toBe(3);
        });
    });

    describe("getPostsCountByAccountId", () => {
        it("retourne le nombre de posts pour un compte", async () => {
            prismaMock.post.count.mockResolvedValue(7);

            const result = await getPostsCountByAccountId(accountId);

            expect(prismaMock.post.count).toHaveBeenCalledWith({
                where: { accountId },
            });
            expect(result).toBe(7);
        });
    });

    describe("getFeedPosts", () => {
        it("retourne les posts publics quand aucun accountId n'est fourni", async () => {
            const posts = [basePost];
            prismaMock.post.findMany.mockResolvedValue(posts);

            const result = await getFeedPosts();

            expect(prismaMock.post.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [{ private: false }],
                },
                orderBy: {
                    creationDate: "desc",
                },
            });
            expect(result).toBe(posts);
        });

        it("retourne les posts publics + ceux des followings + les siens quand accountId est fourni", async () => {
            const posts = [basePost];
            prismaMock.post.findMany.mockResolvedValue(posts);
            getFollowingIdsMock.mockResolvedValue([otherAccountId]);

            const result = await getFeedPosts(accountId);

            expect(getFollowingIdsMock).toHaveBeenCalledWith(accountId);
            expect(prismaMock.post.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { private: false },
                        { accountId: { in: [otherAccountId] } },
                        { accountId },
                    ],
                },
                orderBy: {
                    creationDate: "desc",
                },
            });
            expect(result).toBe(posts);
        });
    });
});
