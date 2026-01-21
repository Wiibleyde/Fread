import LikeController from "../../controllers/like.controller";
import {
    isPostLikedByAccountDB,
    likePostDB,
    unlikePostDB,
} from "../../services/like.service";
import InternalError from "../../errors/internal.error";
import BadRequestError from "../../errors/badrequest.error";
import type { AuthenticatedRequest } from "../../models/auth.model";

jest.mock("../../services/like.service", () => ({
    likePostDB: jest.fn(),
    unlikePostDB: jest.fn(),
    isPostLikedByAccountDB: jest.fn(),
}));

const mockedLikePostDB = likePostDB as jest.MockedFunction<typeof likePostDB>;
const mockedUnlikePostDB =
    unlikePostDB as jest.MockedFunction<typeof unlikePostDB>;
const mockedIsPostLikedByAccountDB =
    isPostLikedByAccountDB as jest.MockedFunction<typeof isPostLikedByAccountDB>;

const controller = new LikeController();

const accountId = "acc_01FZACCOUNT123456789";
const postId = "post_01FZPOST123456789";

const makeReq = (overrides: Partial<AuthenticatedRequest> = {}): any => ({
    account: { id: accountId },
    params: { id: postId },
    ...overrides,
});

describe("LikeController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("likePost", () => {
        it("like un post avec succès", async () => {
            mockedLikePostDB.mockResolvedValue(undefined as any);
            const req = makeReq();

            const result = await controller.likePost(req);

            expect(mockedLikePostDB).toHaveBeenCalledWith(accountId, postId);
            expect(result.liked).toBe(true);
        });

        it("lève InternalError si likePostDB échoue", async () => {
            mockedLikePostDB.mockRejectedValue(new Error("db error"));
            const req = makeReq();

            await expect(controller.likePost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });

    describe("unlikePost", () => {
        it("lève BadRequestError si le post n'est pas liké par ce compte", async () => {
            mockedIsPostLikedByAccountDB.mockResolvedValue(false);
            const req = makeReq();

            await expect(controller.unlikePost(req)).rejects.toBeInstanceOf(
                BadRequestError,
            );
        });

        it("unlike un post avec succès", async () => {
            mockedIsPostLikedByAccountDB.mockResolvedValue(true);
            mockedUnlikePostDB.mockResolvedValue(undefined as any);
            const req = makeReq();

            const result = await controller.unlikePost(req);

            expect(mockedUnlikePostDB).toHaveBeenCalledWith(accountId, postId);
            expect(result.unliked).toBe(true);
        });

        it("lève InternalError si unlikePostDB échoue", async () => {
            mockedIsPostLikedByAccountDB.mockResolvedValue(true);
            mockedUnlikePostDB.mockRejectedValue(new Error("db error"));
            const req = makeReq();

            await expect(controller.unlikePost(req)).rejects.toBeInstanceOf(
                InternalError,
            );
        });
    });
});
