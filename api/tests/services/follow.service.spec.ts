import { prisma } from "../../prisma";
import { followAccountDB, unfollowAccount } from "../../services/follow.service";

// Mock du module prisma exportant `prisma`
jest.mock("../../prisma", () => ({
    __esModule: true,
    prisma: {
        follow: {
            upsert: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe("followAccountDB", () => {
    it("should upsert a follow relation", async () => {
        (prisma.follow.upsert as jest.Mock).mockResolvedValue({ id: "follow-id" });

        const result = await followAccountDB("user1", "user2");

        expect(prisma.follow.upsert).toHaveBeenCalledWith({
            where: {
                accountId_followedAccountId: {
                    accountId: "user1",
                    followedAccountId: "user2",
                },
            },
            update: {},
            create: {
                accountId: "user1",
                followedAccountId: "user2",
            },
        });

        expect(result).toEqual({ id: "follow-id" });
    });

    it("should delete a follow relation", async () => {
        (prisma.follow.delete as jest.Mock).mockResolvedValue({ id: "follow-id" });

        const result = await unfollowAccount("user1", "user2");

        expect(prisma.follow.delete).toHaveBeenCalledWith({
            where: {
                accountId_followedAccountId: {
                    accountId: "user1",
                    followedAccountId: "user2",
                },
            },
        });

        expect(result).toEqual({ id: "follow-id" });
    });
});
