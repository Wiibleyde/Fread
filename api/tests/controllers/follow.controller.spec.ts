jest.mock("../../services/account.service", () => ({
    getAccountByIdDB: jest.fn(),
}));

jest.mock("../../services/follow.service", () => ({
    followAccountDB: jest.fn(),
    unfollowAccount: jest.fn(),
    getFollowersByAccountId: jest.fn(),
    getFollowingByAccountId: jest.fn(),
}));

import FollowController from "../../controllers/follow.controller";
import { getAccountByIdDB } from "../../services/account.service";
import {
    followAccountDB,
    getFollowersByAccountId,
    getFollowingByAccountId,
    unfollowAccount,
} from "../../services/follow.service";
import BadRequestError from "../../errors/badrequest.error";
import NotFoundError from "../../errors/notfound.error";
import InternalError from "../../errors/internal.error";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { Request } from "express";

const mockedGetAccountByIdDB = getAccountByIdDB as jest.MockedFunction<
    typeof getAccountByIdDB
>;
const mockedFollowAccountDB = followAccountDB as jest.MockedFunction<
    typeof followAccountDB
>;
const mockedUnfollowAccount = unfollowAccount as jest.MockedFunction<
    typeof unfollowAccount
>;
const mockedGetFollowersByAccountId =
    getFollowersByAccountId as jest.MockedFunction<typeof getFollowersByAccountId>;
const mockedGetFollowingByAccountId =
    getFollowingByAccountId as jest.MockedFunction<typeof getFollowingByAccountId>;

const controller = new FollowController();

const accountId = "acc_01FZACCOUNT123456789";

const baseAccount = { id: accountId } as any;

const makeAuthReq = (overrides: Partial<AuthenticatedRequest> = {}): any => ({
    account: { id: accountId },
    params: { id: "target" },
    ...overrides,
});

describe("FollowController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("followAccount", () => {
        it("lève BadRequestError si on tente de se follow soi-même", async () => {
            const req = makeAuthReq({ params: { id: accountId } });

            await expect(controller.followAccount(req)).rejects.toBeInstanceOf(
                BadRequestError,
            );
        });

        it("lève NotFoundError si le compte cible n'existe pas", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(null as any);
            const req = makeAuthReq({ params: { id: "target" } });

            await expect(controller.followAccount(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("suit un compte avec succès", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedFollowAccountDB.mockResolvedValue(undefined as any);

            const req = makeAuthReq({ params: { id: "target" } });

            const result = await controller.followAccount(req);

            expect(mockedFollowAccountDB).toHaveBeenCalledWith(accountId, "target");
            expect(result.followed).toBe(true);
        });

        it("lève InternalError si followAccountDB échoue", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedFollowAccountDB.mockRejectedValue(new Error("db error"));

            const req = makeAuthReq({ params: { id: "target" } });

            await expect(controller.followAccount(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("unfollowAccount", () => {
        it("lève BadRequestError si on tente de se unfollow soi-même", async () => {
            const req = makeAuthReq({ params: { id: accountId } });

            await expect(controller.unfollowAccount(req)).rejects.toBeInstanceOf(
                BadRequestError,
            );
        });

        it("unfollow un compte avec succès", async () => {
            mockedUnfollowAccount.mockResolvedValue(undefined as any);
            const req = makeAuthReq({ params: { id: "target" } });

            const result = await controller.unfollowAccount(req);

            expect(mockedUnfollowAccount).toHaveBeenCalledWith(accountId, "target");
            expect(result.unfollowed).toBe(true);
        });

        it("lève InternalError si unfollowAccount échoue", async () => {
            mockedUnfollowAccount.mockRejectedValue(new Error("db error"));
            const req = makeAuthReq({ params: { id: "target" } });

            await expect(controller.unfollowAccount(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("getFollowers", () => {
        it("lève NotFoundError si le compte n'existe pas", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(null as any);
            const req = { params: { id: accountId } } as unknown as Request;

            await expect(controller.getFollowers(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("retourne les followers mappés et le count", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedGetFollowersByAccountId.mockResolvedValue([
                { account: { id: "f1" } },
                { account: { id: "f2" } },
            ] as any);

            const req = { params: { id: accountId } } as unknown as Request;

            const result = await controller.getFollowers(req);

            expect(result).toEqual({
                followers: [{ id: "f1" }, { id: "f2" }],
                count: 2,
            });
        });

        it("lève InternalError si la récupération échoue", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedGetFollowersByAccountId.mockRejectedValue(new Error("db error"));

            const req = { params: { id: accountId } } as unknown as Request;

            await expect(controller.getFollowers(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("getFollowed", () => {
        it("lève NotFoundError si le compte n'existe pas", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(null as any);
            const req = { params: { id: accountId } } as unknown as Request;

            await expect(controller.getFollowed(req)).rejects.toBeInstanceOf(
                NotFoundError,
            );
        });

        it("retourne les comptes suivis mappés et le count", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedGetFollowingByAccountId.mockResolvedValue([
                { followedAccount: { id: "a1" } },
                { followedAccount: { id: "a2" } },
            ] as any);

            const req = { params: { id: accountId } } as unknown as Request;

            const result = await controller.getFollowed(req);

            expect(result).toEqual({
                followed: [{ id: "a1" }, { id: "a2" }],
                count: 2,
            });
        });

        it("lève InternalError si la récupération échoue", async () => {
            mockedGetAccountByIdDB.mockResolvedValue(baseAccount);
            mockedGetFollowingByAccountId.mockRejectedValue(
                new Error("db error"),
            );

            const req = { params: { id: accountId } } as unknown as Request;

            await expect(controller.getFollowed(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });
});
