jest.mock("../../services/post.service", () => ({
    createPostDB: jest.fn(),
    createReplyDB: jest.fn(),
    deletePostByIdDb: jest.fn(),
    editPostById: jest.fn(),
    getFeedPosts: jest.fn(),
    getPostById: jest.fn(),
    getPostLikesCount: jest.fn(),
    getPostRepliesCount: jest.fn(),
    getRepliesForPost: jest.fn(),
}));

jest.mock("../../services/like.service", () => ({
    isPostLikedByAccountDB: jest.fn(),
}));

jest.mock("../../services/follow.service", () => ({
    isFollowing: jest.fn(),
}));

import PostController from "../../controllers/post.controller";
import BadRequestError from "../../errors/badrequest.error";
import InternalError from "../../errors/internal.error";
import NotFoundError from "../../errors/notfound.error";
import UnauthorizedError from "../../errors/unauthorized.error";
import { isFollowing } from "../../services/follow.service";
import { isPostLikedByAccountDB } from "../../services/like.service";
import {
    createPostDB,
    createReplyDB,
    deletePostByIdDb,
    editPostById,
    getFeedPosts,
    getPostById,
    getPostLikesCount,
    getPostRepliesCount,
    getRepliesForPost,
} from "../../services/post.service";

const mockedCreatePostDB = createPostDB as jest.MockedFunction<
    typeof createPostDB
>;
const mockedCreateReplyDB = createReplyDB as jest.MockedFunction<
    typeof createReplyDB
>;
const mockedDeletePostByIdDb = deletePostByIdDb as jest.MockedFunction<
    typeof deletePostByIdDb
>;
const mockedEditPostById = editPostById as jest.MockedFunction<
    typeof editPostById
>;
const mockedGetFeedPosts = getFeedPosts as jest.MockedFunction<
    typeof getFeedPosts
>;
const mockedGetPostById = getPostById as jest.MockedFunction<
    typeof getPostById
>;
const mockedGetPostLikesCount = getPostLikesCount as jest.MockedFunction<
    typeof getPostLikesCount
>;
const mockedGetPostRepliesCount = getPostRepliesCount as jest.MockedFunction<
    typeof getPostRepliesCount
>;
const mockedGetRepliesForPost = getRepliesForPost as jest.MockedFunction<
    typeof getRepliesForPost
>;
const mockedIsPostLikedByAccountDB =
    isPostLikedByAccountDB as jest.MockedFunction<typeof isPostLikedByAccountDB>;
const mockedIsFollowing = isFollowing as jest.MockedFunction<typeof isFollowing>;

const controller = new PostController();

const accountId = "acc_01FZACCOUNT123456789";
const otherAccountId = "acc_01FZACCOUNT987654321";
const postId = "post_01FZPOST123456789";

const basePost = {
    id: postId,
    accountId: otherAccountId,
    content: "Hello",
    private: false,
} as any;

// Helper très souple pour construire un faux AuthenticatedRequest sans se soucier du typage précis
const makeReq = (overrides: any = {}): any => ({
    account: { id: accountId } as any,
    params: { id: postId },
    body: {},
    ...overrides,
});

describe("PostController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPost", () => {
        it("crée un post avec succès", async () => {
            mockedCreatePostDB.mockResolvedValue(basePost);

            const req = makeReq({ body: { content: "Hello", isPrivate: false } });

            const result = await controller.createPost(req);

            expect(mockedCreatePostDB).toHaveBeenCalledWith("Hello", accountId, false);
            expect(result).toEqual({ created: true, message: "Post created" });
        });

        it("lève InternalError si createPostDB échoue", async () => {
            mockedCreatePostDB.mockRejectedValue(new Error("db error"));
            const req = makeReq({ body: { content: "Hello", isPrivate: false } });

            await expect(controller.createPost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("getPost", () => {
        it("lève NotFoundError si le post n'existe pas", async () => {
            mockedGetPostById.mockResolvedValue(null as any);
            const req = makeReq();

            await expect(controller.getPost(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("retourne un post public pour un visiteur anonyme", async () => {
            mockedGetPostById.mockResolvedValue(basePost);
            mockedGetPostLikesCount.mockResolvedValue(2);
            mockedGetPostRepliesCount.mockResolvedValue(1);
            mockedIsPostLikedByAccountDB.mockResolvedValue(false);

            const req = makeReq({ account: undefined });

            const result = await controller.getPost(req);

            expect(result.retrieved).toBe(true);
            expect(result.post).toMatchObject({
                id: postId,
                likesCount: 2,
                repliesCount: 1,
                isLiked: false,
            });
        });

        it("permet à l'auteur de voir son post privé", async () => {
            const privatePost = { ...basePost, private: true, accountId } as any;
            mockedGetPostById.mockResolvedValue(privatePost);
            mockedGetPostLikesCount.mockResolvedValue(0);
            mockedGetPostRepliesCount.mockResolvedValue(0);
            mockedIsPostLikedByAccountDB.mockResolvedValue(false);

            const req = makeReq({ account: { id: accountId } });

            const result = await controller.getPost(req);

            expect(result.retrieved).toBe(true);
        });

        it("permet aux comptes qui se follow mutuellement de voir un post privé", async () => {
            const privatePost = {
                ...basePost,
                private: true,
                accountId: otherAccountId,
            } as any;
            mockedGetPostById.mockResolvedValue(privatePost);
            mockedIsFollowing.mockResolvedValue(true);
            mockedGetPostLikesCount.mockResolvedValue(0);
            mockedGetPostRepliesCount.mockResolvedValue(0);
            mockedIsPostLikedByAccountDB.mockResolvedValue(false);

            const req = makeReq({ account: { id: accountId } });

            const result = await controller.getPost(req);

            expect(result.retrieved).toBe(true);
        });

        it("lève UnauthorizedError si non mutuellement follow pour un post privé", async () => {
            const privatePost = {
                ...basePost,
                private: true,
                accountId: otherAccountId,
            } as any;
            mockedGetPostById.mockResolvedValue(privatePost);
            mockedIsFollowing.mockResolvedValue(false);

            const req = makeReq({ account: { id: accountId } });

            await expect(controller.getPost(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("lève UnauthorizedError pour un post privé vu en anonyme", async () => {
            const privatePost = {
                ...basePost,
                private: true,
                accountId: otherAccountId,
            } as any;
            mockedGetPostById.mockResolvedValue(privatePost);

            const req = makeReq({ account: undefined });

            await expect(controller.getPost(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("enveloppe les erreurs non-AppError dans une InternalError", async () => {
            mockedGetPostById.mockRejectedValue(new Error("db error"));
            const req = makeReq();

            await expect(controller.getPost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("deletePost", () => {
        it("lève BadRequestError si le post n'existe pas", async () => {
            mockedGetPostById.mockResolvedValue(null as any);
            const req = makeReq();

            await expect(controller.deletePost(req)).rejects.toBeInstanceOf(
                BadRequestError,
            );
        });

        it("lève UnauthorizedError si on n'est pas l'auteur", async () => {
            mockedGetPostById.mockResolvedValue(basePost);
            const req = makeReq({ account: { id: accountId } });

            await expect(controller.deletePost(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("supprime le post avec succès", async () => {
            const ownPost = { ...basePost, accountId } as any;
            mockedGetPostById.mockResolvedValue(ownPost);
            mockedDeletePostByIdDb.mockResolvedValue(undefined as any);

            const req = makeReq({ account: { id: accountId } });

            const result = await controller.deletePost(req);

            expect(mockedDeletePostByIdDb).toHaveBeenCalledWith(postId);
            expect(result.deleted).toBe(true);
        });

        it("lève InternalError si deletePostByIdDb échoue", async () => {
            const ownPost = { ...basePost, accountId } as any;
            mockedGetPostById.mockResolvedValue(ownPost);
            mockedDeletePostByIdDb.mockRejectedValue(new Error("db error"));

            const req = makeReq({ account: { id: accountId } });

            await expect(controller.deletePost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("editPost", () => {
        it("lève BadRequestError si le post n'existe pas", async () => {
            mockedGetPostById.mockResolvedValue(null as any);
            const req = makeReq({ body: { content: "new" } });

            await expect(controller.editPost(req)).rejects.toBeInstanceOf(
                BadRequestError,
            );
        });

        it("lève UnauthorizedError si on n'est pas l'auteur", async () => {
            mockedGetPostById.mockResolvedValue(basePost);
            const req = makeReq({ body: { content: "new" } });

            await expect(controller.editPost(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("édite le post avec succès", async () => {
            const ownPost = { ...basePost, accountId } as any;
            const updated = { ...ownPost, content: "updated" } as any;
            mockedGetPostById.mockResolvedValue(ownPost);
            mockedEditPostById.mockResolvedValue(updated);

            const req = makeReq({ account: { id: accountId }, body: { content: "updated" } });

            const result = await controller.editPost(req);

            expect(mockedEditPostById).toHaveBeenCalledWith(
                postId,
                "updated",
                ownPost.private,
            );
            expect(result.edited).toBe(true);
        });

        it("lève InternalError si editPostById lève une erreur générique", async () => {
            const ownPost = { ...basePost, accountId } as any;
            mockedGetPostById.mockResolvedValue(ownPost);
            mockedEditPostById.mockRejectedValue(new Error("db error"));

            const req = makeReq({ account: { id: accountId }, body: { content: "updated" } });

            await expect(controller.editPost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("createReply", () => {
        it("lève NotFoundError si le post de base n'existe pas", async () => {
            mockedGetPostById.mockResolvedValue(null as any);
            const req = makeReq({ body: { content: "reply" } });

            await expect(controller.createReply(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("lève UnauthorizedError si non mutuellement follow pour un post privé", async () => {
            const privatePost = {
                ...basePost,
                private: true,
                accountId: otherAccountId,
            } as any;
            mockedGetPostById.mockResolvedValue(privatePost);
            mockedIsFollowing.mockResolvedValue(false);

            const req = makeReq({ body: { content: "reply" } });

            await expect(controller.createReply(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("crée une reply pour un post public", async () => {
            mockedGetPostById.mockResolvedValue(basePost);
            mockedCreateReplyDB.mockResolvedValue({ id: "reply" } as any);

            const req = makeReq({ body: { content: "reply" } });

            const result = await controller.createReply(req);

            expect(mockedCreateReplyDB).toHaveBeenCalledWith(
                postId,
                "reply",
                accountId,
                basePost.private,
            );
            expect(result.created).toBe(true);
        });
    });

    describe("getReplies", () => {
        it("lève NotFoundError si le post n'existe pas", async () => {
            mockedGetPostById.mockResolvedValue(null as any);
            const req = makeReq();

            await expect(controller.getReplies(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("lève UnauthorizedError si accès non autorisé aux replies d'un post privé", async () => {
            const privatePost = {
                ...basePost,
                private: true,
                accountId: otherAccountId,
            } as any;
            mockedGetPostById.mockResolvedValue(privatePost);
            mockedIsFollowing.mockResolvedValue(false);

            const req = makeReq({ account: { id: accountId } });

            await expect(controller.getReplies(req)).rejects.toBeInstanceOf(
                UnauthorizedError,
            );
        });

        it("retourne les replies mappées pour un post public", async () => {
            mockedGetPostById.mockResolvedValue(basePost);
            mockedGetRepliesForPost.mockResolvedValue([
                { replyPostId: "reply_post_id", replyPost: { id: "reply_post_id" } },
            ] as any);
            mockedGetPostLikesCount.mockResolvedValue(1);
            mockedGetPostRepliesCount.mockResolvedValue(0);
            mockedIsPostLikedByAccountDB.mockResolvedValue(false);

            const req = makeReq({ account: { id: accountId } });

            const result = await controller.getReplies(req);

            expect(result.retrieved).toBe(true);
            expect(result.replies[0]).toMatchObject({
                id: "reply_post_id",
                likesCount: 1,
                repliesCount: 0,
            });
        });
    });

    describe("getFeed", () => {
        it("retourne le feed mappé avec stats", async () => {
            mockedGetFeedPosts.mockResolvedValue([basePost]);
            mockedGetPostLikesCount.mockResolvedValue(2);
            mockedGetPostRepliesCount.mockResolvedValue(1);
            mockedIsPostLikedByAccountDB.mockResolvedValue(true);

            const req = makeReq({ account: { id: accountId } });

            const result = await controller.getFeed(req);

            expect(mockedGetFeedPosts).toHaveBeenCalledWith(accountId);
            expect(result.retrieved).toBe(true);
            expect(result.posts[0]).toMatchObject({
                id: postId,
                likesCount: 2,
                repliesCount: 1,
                isLiked: true,
            });
        });

        it("lève InternalError si getFeedPosts échoue", async () => {
            mockedGetFeedPosts.mockRejectedValue(new Error("db error"));
            const req = makeReq({ account: { id: accountId } });

            await expect(controller.getFeed(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });
});
