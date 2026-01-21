import type { Request } from "express";
import { env } from "../../env";
import { prisma } from "../../prisma";
import {
    buildAuthUrl,
    getCodeFromCallback,
    getAccessTokenFromCallback,
    getUserInfo,
    createUser,
} from "../../services/oauth.service";
import * as accountService from "../../services/account.service";
import * as fileService from "../../services/file.service";

// Mocks
jest.mock("../../env", () => ({
    env: {
        AUTH_DISCORD_ID: "discord_client_id",
        AUTH_DISCORD_SECRET: "discord_secret",
        DISCORD_REDIRECT_URI: "https://app.example.com/auth/discord/callback",
        AUTH_GOOGLE_ID: "google_client_id",
        AUTH_GOOGLE_SECRET: "google_secret",
        GOOGLE_REDIRECT_URI: "https://app.example.com/auth/google/callback",
    },
}));

jest.mock("../../prisma", () => ({
    prisma: {
        account: {
            update: jest.fn(),
        },
    },
}));

jest.mock("../../services/account.service");
jest.mock("../../services/file.service");

const prismaMock = prisma as unknown as {
    account: {
        update: jest.Mock;
    };
};

const accountServiceMock = accountService as jest.Mocked<typeof accountService>;
const fileServiceMock = fileService as jest.Mocked<typeof fileService>;

// Helper pour mocker global fetch
const globalAny: any = global;

describe("oauth.service - buildAuthUrl", () => {
    it("construit correctement l'URL d'auth Discord", () => {
        const url = buildAuthUrl("discord");

        expect(url).toContain("https://discord.com/oauth2/authorize");
        expect(url).toContain(`client_id=${env.AUTH_DISCORD_ID}`);
        expect(url).toContain(encodeURIComponent(env.DISCORD_REDIRECT_URI));
    });

    it("construit correctement l'URL d'auth Google", () => {
        const url = buildAuthUrl("google");

        expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth?");
        expect(url).toContain(`client_id=${env.AUTH_GOOGLE_ID}`);
        expect(url).toContain(encodeURIComponent(env.GOOGLE_REDIRECT_URI));
    });
});

describe("oauth.service - getCodeFromCallback", () => {
    it("récupère le code de la query string", () => {
        const req = { query: { code: "auth-code-123" } } as unknown as Request;

        const code = getCodeFromCallback(req);

        expect(code).toBe("auth-code-123");
    });
});

describe("oauth.service - getAccessTokenFromCallback", () => {
    beforeEach(() => {
        globalAny.fetch = jest.fn();
    });

    it("échange un code Discord contre un access_token", async () => {
        const fakeResponse = {
            ok: true,
            json: async () => ({ access_token: "discord_token", token_type: "Bearer" }),
            text: async () => "",
        };

        globalAny.fetch.mockResolvedValue(fakeResponse);

        const result = await getAccessTokenFromCallback("discord", "code123");

        expect(globalAny.fetch).toHaveBeenCalled();
        expect(result).toEqual({ access_token: "discord_token", token_type: "Bearer" });
    });

    it("échange un code Google contre un access_token", async () => {
        const fakeResponse = {
            ok: true,
            json: async () => ({ access_token: "google_token", token_type: "Bearer" }),
            text: async () => "",
        };

        globalAny.fetch.mockResolvedValue(fakeResponse);

        const result = await getAccessTokenFromCallback("google", "code123");

        expect(globalAny.fetch).toHaveBeenCalled();
        expect(result).toEqual({ access_token: "google_token", token_type: "Bearer" });
    });
});

describe("oauth.service - getUserInfo", () => {
    beforeEach(() => {
        globalAny.fetch = jest.fn();
    });

    it("récupère les infos utilisateur Discord", async () => {
        const fakeResponse = {
            ok: true,
            json: async () => ({
                id: "discord_123",
                username: "john_discord",
                avatar: "avatarhash",
                global_name: "John Discord",
            }),
            text: async () => "",
        };

        globalAny.fetch.mockResolvedValue(fakeResponse);

        const result = await getUserInfo("discord", "token", "Bearer");

        expect(globalAny.fetch).toHaveBeenCalled();
        expect(result).toEqual({
            discordId: "discord_123",
            username: "john_discord",
            picture: "https://cdn.discordapp.com/avatars/discord_123/avatarhash.png",
            name: "John Discord",
        });
    });

    it("récupère les infos utilisateur Google", async () => {
        const fakeResponse = {
            ok: true,
            json: async () => ({
                sub: "google_123",
                email: "john@example.com",
                picture: "https://example.com/avatar.png",
                name: "John Google",
            }),
            text: async () => "",
        };

        globalAny.fetch.mockResolvedValue(fakeResponse);

        const result = await getUserInfo("google", "token", "Bearer");

        expect(globalAny.fetch).toHaveBeenCalled();
        expect(result).toEqual({
            googleId: "google_123",
            username: "john@example.com",
            picture: "https://example.com/avatar.png",
            name: "John Google",
        });
    });
});

describe("oauth.service - createUser", () => {
    const accountId = "acc_01FZACCOUNT123456789";

    const baseAccount = {
        id: accountId,
        username: "john@example.com",
        displayName: "John Example",
        description: "",
        private: false,
        profilePictureId: null,
        appleId: null,
        googleId: "google_123",
        discordId: undefined,
        admin: false,
        profileCompleted: false,
        createdAt: new Date("2025-01-01T12:00:00.000Z"),
        updatedAt: new Date("2025-01-01T12:00:00.000Z"),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("crée un utilisateur avec username unique et sans image", async () => {
        accountServiceMock.getAccountByUsernameDB
            .mockResolvedValueOnce(null as any); // username libre

        accountServiceMock.createAccountDB.mockResolvedValue(baseAccount);

        const result = await createUser({
            googleId: "google_123",
            discordId: undefined,
            username: "john@example.com",
            picture: null,
            name: "John Example",
        });

        expect(accountServiceMock.getAccountByUsernameDB).toHaveBeenCalledWith(
            "john@example.com",
        );
        expect(accountServiceMock.createAccountDB).toHaveBeenCalledWith({
            googleId: "google_123",
            discordId: undefined,
            username: "john@example.com",
            profileCompleted: false,
            description: "",
            displayName: "John Example",
        });
        expect(result).toBe(baseAccount);
    });

    it("crée un utilisateur avec image de profil et met à jour profilePictureId", async () => {
        const accountWithPic = { ...baseAccount };

        accountServiceMock.getAccountByUsernameDB
            .mockResolvedValueOnce(null as any);

        accountServiceMock.createAccountDB.mockResolvedValue(accountWithPic);

        const file = {
            id: "file_01FZPROFILEPIC123456",
            accountId,
            creationDate: new Date("2025-01-01T12:00:00.000Z"),
            fileName: "https://example.com/avatar.png",
            profileForId: accountId,
        } as any;

        fileServiceMock.createFileDB.mockResolvedValue(file);
        prismaMock.account.update.mockResolvedValue({ ...accountWithPic, profilePictureId: file.id });

        const result = await createUser({
            googleId: "google_123",
            discordId: undefined,
            username: "john@example.com",
            picture: "https://example.com/avatar.png",
            name: "John Example",
        });

        expect(fileServiceMock.createFileDB).toHaveBeenCalledWith(
            accountWithPic.id,
            "https://example.com/avatar.png",
        );
        expect(prismaMock.account.update).toHaveBeenCalledWith({
            where: { id: accountWithPic.id },
            data: { profilePictureId: file.id },
        });
        expect(result).toBe(accountWithPic);
    });
});
