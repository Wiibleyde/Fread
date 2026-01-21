jest.mock("../../services/account.service", () => ({
    getAccountByDiscordIdDB: jest.fn(),
    getAccountByGoogleIdDB: jest.fn(),
}));

jest.mock("../../services/oauth.service", () => ({
    buildAuthUrl: jest.fn(),
    createUser: jest.fn(),
    getAccessTokenFromCallback: jest.fn(),
    getCodeFromCallback: jest.fn(),
    getUserInfo: jest.fn(),
}));

jest.mock("../../utils/jwt", () => ({
    generateJWT: jest.fn(),
}));

import AuthController from "../../controllers/auth.controller";
import {
    getAccountByDiscordIdDB,
    getAccountByGoogleIdDB,
} from "../../services/account.service";
import {
    buildAuthUrl,
    createUser,
    getAccessTokenFromCallback,
    getCodeFromCallback,
    getUserInfo,
} from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";
import InternalError from "../../errors/internal.error";
import type { Request } from "express";

const mockedBuildAuthUrl = buildAuthUrl as jest.MockedFunction<
    typeof buildAuthUrl
>;
const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockedGetAccessTokenFromCallback =
    getAccessTokenFromCallback as jest.MockedFunction<
        typeof getAccessTokenFromCallback
    >;
const mockedGetCodeFromCallback = getCodeFromCallback as jest.MockedFunction<
    typeof getCodeFromCallback
>;
const mockedGetUserInfo = getUserInfo as jest.MockedFunction<
    typeof getUserInfo
>;
const mockedGetAccountByDiscordIdDB =
    getAccountByDiscordIdDB as jest.MockedFunction<
        typeof getAccountByDiscordIdDB
    >;
const mockedGetAccountByGoogleIdDB =
    getAccountByGoogleIdDB as jest.MockedFunction<
        typeof getAccountByGoogleIdDB
    >;
const mockedGenerateJWT = generateJWT as jest.MockedFunction<typeof generateJWT>;

describe("AuthController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("redirect", () => {
        it("retourne l'URL d'auth construite par le service", () => {
            const controller = new AuthController("discord");
            mockedBuildAuthUrl.mockReturnValue("https://discord.example");

            const url = controller.redirect();

            expect(mockedBuildAuthUrl).toHaveBeenCalledWith("discord");
            expect(url).toBe("https://discord.example");
        });
    });

    describe("callback (discord)", () => {
        const req = { query: { code: "code123" } } as unknown as Request;

        it("authentifie un utilisateur discord existant", async () => {
            const controller = new AuthController("discord");

            mockedGetCodeFromCallback.mockReturnValue("code123");
            mockedGetAccessTokenFromCallback.mockResolvedValue({
                access_token: "token",
                token_type: "Bearer",
            });
            mockedGetUserInfo.mockResolvedValue({
                discordId: "discord_123",
                googleId: undefined,
                username: "john_discord",
                picture: null,
                name: "John Discord",
            } as any);
            const account = { id: "acc_1" } as any;
            mockedGetAccountByDiscordIdDB.mockResolvedValue(account);
            mockedGenerateJWT.mockReturnValue("jwt-token");

            const result = await controller.callback(req);

            expect(mockedGetAccountByDiscordIdDB).toHaveBeenCalledWith("discord_123");
            expect(mockedCreateUser).not.toHaveBeenCalled();
            expect(mockedGenerateJWT).toHaveBeenCalledWith(account);
            expect(result).toEqual({ token: "jwt-token" });
        });

        it("crée un utilisateur discord si aucun compte n'existe", async () => {
            const controller = new AuthController("discord");

            mockedGetCodeFromCallback.mockReturnValue("code123");
            mockedGetAccessTokenFromCallback.mockResolvedValue({
                access_token: "token",
                token_type: "Bearer",
            });
            const oauthInfos = {
                discordId: "discord_123",
                googleId: undefined,
                username: "john_discord",
                picture: null,
                name: "John Discord",
            } as any;
            mockedGetUserInfo.mockResolvedValue(oauthInfos);
            mockedGetAccountByDiscordIdDB.mockResolvedValue(null as any);
            const createdAccount = { id: "acc_new" } as any;
            mockedCreateUser.mockResolvedValue(createdAccount);
            mockedGenerateJWT.mockReturnValue("jwt-token");

            const result = await controller.callback(req);

            expect(mockedCreateUser).toHaveBeenCalledWith(oauthInfos);
            expect(mockedGenerateJWT).toHaveBeenCalledWith(createdAccount);
            expect(result).toEqual({ token: "jwt-token" });
        });

        it("enveloppe toute erreur dans une InternalError", async () => {
            const controller = new AuthController("discord");

            mockedGetCodeFromCallback.mockReturnValue("code123");
            mockedGetAccessTokenFromCallback.mockRejectedValue(
                new Error("oauth error"),
            );

            await expect(controller.callback(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("callback (google)", () => {
        const req = { query: { code: "code123" } } as unknown as Request;

        it("authentifie un utilisateur google existant", async () => {
            const controller = new AuthController("google");

            mockedGetCodeFromCallback.mockReturnValue("code123");
            mockedGetAccessTokenFromCallback.mockResolvedValue({
                access_token: "token",
                token_type: "Bearer",
            });
            mockedGetUserInfo.mockResolvedValue({
                googleId: "google_123",
                discordId: undefined,
                username: "john@example.com",
                picture: null,
                name: "John Google",
            } as any);
            const account = { id: "acc_1" } as any;
            mockedGetAccountByGoogleIdDB.mockResolvedValue(account);
            mockedGenerateJWT.mockReturnValue("jwt-token");

            const result = await controller.callback(req);

            expect(mockedGetAccountByGoogleIdDB).toHaveBeenCalledWith("google_123");
            expect(mockedCreateUser).not.toHaveBeenCalled();
            expect(result).toEqual({ token: "jwt-token" });
        });
    });
});
