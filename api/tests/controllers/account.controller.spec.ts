jest.mock("../../services/account.service", () => ({
    getAccountByIdDB: jest.fn(),
    deleteAccount: jest.fn(),
    editAccountDb: jest.fn(),
}));

jest.mock("../../services/follow.service", () => ({
    getFollowersByAccountId: jest.fn(),
    getFollowersCount: jest.fn(),
    getFollowingByAccountId: jest.fn(),
    getFollowingCount: jest.fn(),
    isFollowing: jest.fn(),
}));

jest.mock("../../services/like.service", () => ({
    isPostLikedByAccountDB: jest.fn(),
}));

jest.mock("../../services/post.service", () => ({
    getPostsByAccountId: jest.fn(),
    getPostsCountByAccountId: jest.fn(),
    getPostLikesCount: jest.fn(),
    getPostRepliesCount: jest.fn(),
}));

import AccountController from "../../controllers/account.controller";
import {
    deleteAccount,
    editAccountDb,
    getAccountByIdDB,
} from "../../services/account.service";
import {
    getFollowersByAccountId,
    getFollowersCount,
    getFollowingByAccountId,
    getFollowingCount,
    isFollowing,
} from "../../services/follow.service";
import { isPostLikedByAccountDB } from "../../services/like.service";
import {
    getPostLikesCount,
    getPostRepliesCount,
    getPostsByAccountId,
    getPostsCountByAccountId,
} from "../../services/post.service";
import ForbiddenError from "../../errors/forbidden.error";
import InternalError from "../../errors/internal.error";

jest.mock("../../services/post.service", () => ({
    getPostLikesCount: jest.fn(),
    getPostRepliesCount: jest.fn(),
    getPostsByAccountId: jest.fn(),
    getPostsCountByAccountId: jest.fn(),
}));

const mockedGetAccountByIdDB = getAccountByIdDB as jest.MockedFunction<
    typeof getAccountByIdDB
>;
const mockedDeleteAccount = deleteAccount as jest.MockedFunction<
    typeof deleteAccount
>;
const mockedEditAccountDb = editAccountDb as jest.MockedFunction<
    typeof editAccountDb
>;

const mockedGetFollowersByAccountId =
    getFollowersByAccountId as jest.MockedFunction<typeof getFollowersByAccountId>;
const mockedGetFollowersCount = getFollowersCount as jest.MockedFunction<
    typeof getFollowersCount
>;
const mockedGetFollowingByAccountId =
    getFollowingByAccountId as jest.MockedFunction<typeof getFollowingByAccountId>;
const mockedGetFollowingCount = getFollowingCount as jest.MockedFunction<
    typeof getFollowingCount
>;
const mockedIsFollowing = isFollowing as jest.MockedFunction<typeof isFollowing>;

const mockedIsPostLikedByAccountDB =
    isPostLikedByAccountDB as jest.MockedFunction<typeof isPostLikedByAccountDB>;

const mockedGetPostLikesCount = getPostLikesCount as jest.MockedFunction<
    typeof getPostLikesCount
>;
const mockedGetPostRepliesCount = getPostRepliesCount as jest.MockedFunction<
    typeof getPostRepliesCount
>;
const mockedGetPostsByAccountId = getPostsByAccountId as jest.MockedFunction<
    typeof getPostsByAccountId
>;
const mockedGetPostsCountByAccountId =
    getPostsCountByAccountId as jest.MockedFunction<typeof getPostsCountByAccountId>;

const controller = new AccountController();

const accountId = "acc_01FZACCOUNT123456789";

const baseAccount = {
    id: accountId,
    username: "john_doe",
    displayName: "John Doe",
    description: "Developer",
    private: false,
    profilePictureId: null,
    appleId: null,
    googleId: "google_123",
    discordId: "discord_123",
    admin: false,
    profileCompleted: true,
    createdAt: new Date("2025-01-01T12:00:00.000Z"),
    updatedAt: new Date("2025-01-01T12:00:00.000Z"),
};

describe("AccountController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProfile", () => {
        it("retourne retrieved=false si pas d'id", async () => {
            const req: any = { params: {}, account: undefined };

            const result = await controller.getProfile(req);

            expect(result).toEqual({ account: null, retrieved: false });
            expect(mockedGetAccountByIdDB).not.toHaveBeenCalled();
        });

        it("retourne retrieved=false si le compte n'existe pas", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(null as any);
            const req: any = { params: { id: accountId }, account: undefined };

            const result = await controller.getProfile(req);

            expect(mockedGetAccountByIdDB).toHaveBeenCalledWith(accountId);
            expect(result).toEqual({ account: null, retrieved: false });
        });

        it("retourne le profil avec stats et follow info", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount as any);
            mockedGetPostsCountByAccountId.mockResolvedValue(3);
            mockedGetFollowersCount.mockResolvedValue(5);
            mockedGetFollowingCount.mockResolvedValue(2);
            mockedGetFollowersByAccountId.mockResolvedValue([] as any);
            mockedGetFollowingByAccountId.mockResolvedValue([] as any);
            mockedIsFollowing.mockResolvedValue(true);

            const viewerId = "acc_viewer";
            const req: any = { params: { id: accountId }, account: { id: viewerId } };

            const result = await controller.getProfile(req);

            expect(result.retrieved).toBe(true);
            expect(result.account).not.toBeNull();
            expect(result.account!.id).toBe(accountId);
            expect(result.account!.postsCount).toBe(3);
            expect(result.account!.followersCount).toBe(5);
            expect(result.account!.followingCount).toBe(2);
            expect(result.account!.isFollowing).toBe(true);
        });
    });

    describe("deleteAccount", () => {
        it("lève ForbiddenError si on tente de supprimer un autre compte", async () => {
            const req: any = {
                params: { id: "other" },
                account: { id: accountId },
            };

            await expect(controller.deleteAccount(req)).rejects.toBeInstanceOf(
                ForbiddenError,
            );

            expect(mockedDeleteAccount).not.toHaveBeenCalled();
        });

        it("supprime le compte et renvoie deleted=true", async () => {
            mockedDeleteAccount.mockResolvedValue(undefined as any);
            const req: any = {
                params: { id: accountId },
                account: { id: accountId },
            };

            const result = await controller.deleteAccount(req);

            expect(mockedDeleteAccount).toHaveBeenCalledWith(accountId);
            expect(result).toEqual({
                deleted: true,
                message: "Account deleted successfully",
            });
        });

        it("remonte une InternalError si la suppression échoue", async () => {
            mockedDeleteAccount.mockRejectedValue(new Error("db error"));
            const req: any = {
                params: { id: accountId },
                account: { id: accountId },
            };

            await expect(controller.deleteAccount(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("getPosts", () => {
        it("lève InternalError si pas d'id dans les params", async () => {
            const req: any = { params: {}, account: { id: accountId } };

            await expect(controller.getPosts(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });

        it("retourne les posts mappés avec likes/replies/isLiked", async () => {
            const posts = [
                { id: "post_1", accountId, content: "Hello", private: false },
            ];
            mockedGetPostsByAccountId.mockResolvedValue(posts as any);
            mockedGetPostLikesCount.mockResolvedValue(2);
            mockedGetPostRepliesCount.mockResolvedValue(1);
            mockedIsPostLikedByAccountDB.mockResolvedValue(true);

            const req: any = { params: { id: accountId }, account: { id: accountId } };

            const result = await controller.getPosts(req);

            expect(result.retrieved).toBe(true);
            expect(result.posts[0]).toMatchObject({
                id: "post_1",
                likesCount: 2,
                repliesCount: 1,
                isLiked: true,
            });
        });

        it("remonte une InternalError si la récupération échoue", async () => {
            mockedGetPostsByAccountId.mockRejectedValue(new Error("db error"));
            const req: any = { params: { id: accountId }, account: { id: accountId } };

            await expect(controller.getPosts(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("editAccount", () => {
        it("édite le compte avec les données fournies", async () => {
            mockedEditAccountDb.mockResolvedValue(undefined as any);

            const req: any = {
                account: { id: accountId },
                body: {
                    displayName: "New Name",
                    description: "New description",
                    isPrivate: true,
                },
            };

            const result = await controller.editAccount(req);

            expect(mockedEditAccountDb).toHaveBeenCalledWith(accountId, {
                displayName: "New Name",
                description: "New description",
                private: true,
            });
            expect(result).toEqual({
                edited: true,
                message: "Account edited successfully",
            });
        });

        it("remonte une InternalError si l'édition échoue", async () => {
            mockedEditAccountDb.mockRejectedValue(new Error("db error"));

            const req: any = {
                account: { id: accountId },
                body: {
                    displayName: "New Name",
                    description: "New description",
                    isPrivate: true,
                },
            };

            await expect(controller.editAccount(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });
});
