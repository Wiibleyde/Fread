jest.mock("../../prisma", () => ({
    prisma: {
        follow: {
            upsert: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        account: {
            findUnique: jest.fn(),
        },
    },
}));

import { prisma } from "../../prisma";
import {
    followAccountDB,
    unfollowAccount,
    isFollowing,
    getFollowersCount,
    getFollowingCount,
    getFollowersByAccountId,
    getFollowingByAccountId,
    getFollowingIds,
} from "../../services/follow.service";

// --- Jeu de données de base, proche de ce que renverrait Prisma ---
const followerAccountId = "acc_01FZ123456789follower";
const followedAccountId = "acc_01FZ987654321followed";

const baseDate = new Date("2025-01-01T12:00:00.000Z");

const followerAccount = {
    id: followerAccountId,
    username: "john_doe",
    displayName: "John Doe",
    description: "Developer",
    private: false,
    profileCompleted: true,
    appleId: null,
    googleId: null,
    discordId: null,
    admin: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    profilePictureId: null,
};

const followedAccount = {
    id: followedAccountId,
    username: "jane_doe",
    displayName: "Jane Doe",
    description: "Designer",
    private: false,
    profileCompleted: true,
    appleId: null,
    googleId: null,
    discordId: null,
    admin: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    profilePictureId: "file_01FZPROFILEPIC",
};

const profilePictureFile = {
    id: "file_01FZPROFILEPIC",
    accountId: followerAccountId,
    creationDate: baseDate,
    fileName: "avatar.png",
};

const baseFollow = {
    id: "fol_01FZFOLLOWRELATION",
    accountId: followerAccountId,
    followedAccountId,
    createdAt: baseDate,
};

// --- Mock Prisma une seule fois, en haut ---
jest.mock("../../prisma", () => ({
    prisma: {
        follow: {
            upsert: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

const prismaMock = prisma as unknown as {
    follow: {
        upsert: jest.Mock;
        delete: jest.Mock;
        findUnique: jest.Mock;
        count: jest.Mock;
        findMany: jest.Mock;
    };
};

describe("follow.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("followAccountDB", () => {
        it("appelle prisma.follow.upsert avec les bons paramètres et renvoie le résultat", async () => {
            const followRecord = baseFollow;
            prismaMock.follow.upsert.mockResolvedValue(followRecord);

            const result = await followAccountDB(followerAccountId, followedAccountId);

            expect(prismaMock.follow.upsert).toHaveBeenCalledWith({
                where: {
                    accountId_followedAccountId: {
                        accountId: followerAccountId,
                        followedAccountId,
                    },
                },
                update: {},
                create: {
                    accountId: followerAccountId,
                    followedAccountId,
                },
            });
            expect(result).toBe(followRecord);
        });
    });

    describe("unfollowAccount", () => {
        it("appelle prisma.follow.delete avec les bons paramètres", async () => {
            const deleted = baseFollow;
            prismaMock.follow.delete.mockResolvedValue(deleted);

            const result = await unfollowAccount(followerAccountId, followedAccountId);

            expect(prismaMock.follow.delete).toHaveBeenCalledWith({
                where: {
                    accountId_followedAccountId: {
                        accountId: followerAccountId,
                        followedAccountId,
                    },
                },
            });
            expect(result).toBe(deleted);
        });
    });

    describe("isFollowing", () => {
        it("retourne true quand un enregistrement existe", async () => {
            prismaMock.follow.findUnique.mockResolvedValue(baseFollow);

            const result = await isFollowing(followerAccountId, followedAccountId);

            expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    accountId_followedAccountId: {
                        accountId: followerAccountId,
                        followedAccountId,
                    },
                },
            });
            expect(result).toBe(true);
        });

        it("retourne false quand aucun enregistrement n'existe", async () => {
            prismaMock.follow.findUnique.mockResolvedValue(null);

            const result = await isFollowing(followerAccountId, followedAccountId);

            expect(result).toBe(false);
        });
    });

    describe("getFollowersCount", () => {
        it("appelle prisma.follow.count avec followedAccountId et renvoie le nombre", async () => {
            prismaMock.follow.count.mockResolvedValue(5);

            const result = await getFollowersCount(followedAccountId);

            expect(prismaMock.follow.count).toHaveBeenCalledWith({
                where: { followedAccountId },
            });
            expect(result).toBe(5);
        });
    });

    describe("getFollowingCount", () => {
        it("appelle prisma.follow.count avec accountId et renvoie le nombre", async () => {
            prismaMock.follow.count.mockResolvedValue(3);

            const result = await getFollowingCount(followerAccountId);

            expect(prismaMock.follow.count).toHaveBeenCalledWith({
                where: { accountId: followerAccountId },
            });
            expect(result).toBe(3);
        });
    });

    describe("getFollowersByAccountId", () => {
        it("appelle prisma.follow.findMany avec followedAccountId et include.account", async () => {
            const followers = [
                {
                    ...baseFollow,
                    account: {
                        ...followerAccount,
                        profilePicture: profilePictureFile,
                    },
                },
            ];
            prismaMock.follow.findMany.mockResolvedValue(followers);

            const result = await getFollowersByAccountId(followedAccountId);

            expect(prismaMock.follow.findMany).toHaveBeenCalledWith({
                where: { followedAccountId },
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
            expect(result).toBe(followers);
        });
    });

    describe("getFollowingByAccountId", () => {
        it("appelle prisma.follow.findMany avec accountId et include.followedAccount", async () => {
            const following = [
                {
                    ...baseFollow,
                    followedAccount: {
                        ...followedAccount,
                        profilePicture: profilePictureFile,
                    },
                },
            ];
            prismaMock.follow.findMany.mockResolvedValue(following);

            const result = await getFollowingByAccountId(followerAccountId);

            expect(prismaMock.follow.findMany).toHaveBeenCalledWith({
                where: { accountId: followerAccountId },
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
            expect(result).toBe(following);
        });
    });

    describe("getFollowingIds", () => {
        it("retourne uniquement les IDs suivis", async () => {
            prismaMock.follow.findMany.mockResolvedValue([
                { followedAccountId: "acc_01FZ111" },
                { followedAccountId: "acc_01FZ222" },
            ]);

            const result = await getFollowingIds(followerAccountId);

            expect(prismaMock.follow.findMany).toHaveBeenCalledWith({
                where: { accountId: followerAccountId },
                select: { followedAccountId: true },
            });
            expect(result).toEqual(["acc_01FZ111", "acc_01FZ222"]);
        });
    });
});
