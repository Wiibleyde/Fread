import { prisma } from "../../prisma";
import {
    createAccountDB,
    getAccountByIdDB,
    getAccountByUsernameDB,
    getAccountByDiscordIdDB,
    getAccountByGoogleIdDB,
    deleteAccount,
    editAccountDb,
} from "../../services/account.service";

// Jeu de données réaliste pour Account / File
const accountId = "acc_01FZACCOUNT123456789";
const profilePictureId = "file_01FZPROFILEPIC123456";

const baseDate = new Date("2025-01-01T12:00:00.000Z");

const baseAccount = {
    id: accountId,
    username: "john_doe",
    displayName: "John Doe",
    description: "Developer",
    private: false,
    profilePictureId,
    appleId: null,
    googleId: "google_123",
    discordId: "discord_123",
    admin: false,
    profileCompleted: true,
    createdAt: baseDate,
    updatedAt: baseDate,
};

const profilePictureFile = {
    id: profilePictureId,
    accountId,
    creationDate: baseDate,
    fileName: "avatar.png",
};

jest.mock("../../prisma", () => ({
    prisma: {
        account: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
    },
}));

const prismaMock = prisma as unknown as {
    account: {
        create: jest.Mock;
        findUnique: jest.Mock;
        delete: jest.Mock;
        update: jest.Mock;
    };
};

describe("account.service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAccountDB", () => {
        it("crée un compte avec les bons champs", async () => {
            prismaMock.account.create.mockResolvedValue(baseAccount);

            const result = await createAccountDB({
                username: baseAccount.username,
                displayName: baseAccount.displayName,
                description: baseAccount.description,
                private: baseAccount.private,
                profilePictureId: baseAccount.profilePictureId!,
                appleId: baseAccount.appleId!,
                googleId: baseAccount.googleId!,
                discordId: baseAccount.discordId!,
                profileCompleted: baseAccount.profileCompleted,
            });

            expect(prismaMock.account.create).toHaveBeenCalledWith({
                data: {
                    username: baseAccount.username,
                    displayName: baseAccount.displayName,
                    description: baseAccount.description,
                    private: baseAccount.private,
                    profilePictureId: baseAccount.profilePictureId,
                    appleId: baseAccount.appleId,
                    googleId: baseAccount.googleId,
                    discordId: baseAccount.discordId,
                    profileCompleted: baseAccount.profileCompleted,
                },
            });
            expect(result).toBe(baseAccount);
        });
    });

    describe("getAccountByUsernameDB", () => {
        it("récupère un compte via son username", async () => {
            prismaMock.account.findUnique.mockResolvedValue(baseAccount);

            const result = await getAccountByUsernameDB(baseAccount.username);

            expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
                where: { username: baseAccount.username },
            });
            expect(result).toBe(baseAccount);
        });
    });

    describe("getAccountByDiscordIdDB", () => {
        it("récupère un compte via son discordId", async () => {
            prismaMock.account.findUnique.mockResolvedValue(baseAccount);

            const result = await getAccountByDiscordIdDB(baseAccount.discordId!);

            expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
                where: { discordId: baseAccount.discordId },
            });
            expect(result).toBe(baseAccount);
        });
    });

    describe("getAccountByGoogleIdDB", () => {
        it("récupère un compte via son googleId", async () => {
            prismaMock.account.findUnique.mockResolvedValue(baseAccount);

            const result = await getAccountByGoogleIdDB(baseAccount.googleId!);

            expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
                where: { googleId: baseAccount.googleId },
            });
            expect(result).toBe(baseAccount);
        });
    });

    describe("getAccountByIdDB", () => {
        it("récupère un compte via son id avec include.profilePicture", async () => {
            const accountWithPicture = { ...baseAccount, profilePicture: profilePictureFile };
            prismaMock.account.findUnique.mockResolvedValue(accountWithPicture);

            const result = await getAccountByIdDB(accountId);

            expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
                where: { id: accountId },
                include: {
                    profilePicture: {
                        select: {
                            id: true,
                            fileName: true,
                        },
                    },
                },
            });
            expect(result).toBe(accountWithPicture);
        });
    });

    describe("deleteAccount", () => {
        it("supprime un compte par id", async () => {
            prismaMock.account.delete.mockResolvedValue(baseAccount);

            const result = await deleteAccount(accountId);

            expect(prismaMock.account.delete).toHaveBeenCalledWith({
                where: { id: accountId },
            });
            expect(result).toBe(baseAccount);
        });
    });

    describe("editAccountDb", () => {
        it("met à jour les champs éditables du compte", async () => {
            const updated = {
                ...baseAccount,
                displayName: "John Updated",
                description: "Updated description",
                private: true,
            };
            prismaMock.account.update.mockResolvedValue(updated);

            const result = await editAccountDb(accountId, {
                displayName: updated.displayName,
                description: updated.description,
                private: updated.private,
            });

            expect(prismaMock.account.update).toHaveBeenCalledWith({
                where: { id: accountId },
                data: {
                    displayName: updated.displayName,
                    description: updated.description,
                    private: updated.private,
                },
            });
            expect(result).toBe(updated);
        });

        it("convertit description null en chaîne vide", async () => {
            const updated = { ...baseAccount, description: "" };
            prismaMock.account.update.mockResolvedValue(updated);

            await editAccountDb(accountId, {
                description: null,
            });

            expect(prismaMock.account.update).toHaveBeenCalledWith({
                where: { id: accountId },
                data: {
                    displayName: undefined,
                    description: "",
                    private: undefined,
                },
            });
        });
    });
});
