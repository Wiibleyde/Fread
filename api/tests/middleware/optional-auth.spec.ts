jest.mock("../../prisma", () => ({
    prisma: {
        account: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock("../../services/auth.service");
jest.mock("../../utils/jwt");

import { optionalAuthMiddleware } from "../../middleware/optional-auth";
import { authenticateUser } from "../../services/auth.service";
import { getTokenFromAuthorizationHeader, verifyJWT } from "../../utils/jwt";
import type { Request, Response, NextFunction } from "express";

const mockedAuthenticateUser = authenticateUser as jest.MockedFunction<typeof authenticateUser>;
const mockedGetToken = getTokenFromAuthorizationHeader as jest.MockedFunction<typeof getTokenFromAuthorizationHeader>;
const mockedVerifyJWT = verifyJWT as jest.MockedFunction<typeof verifyJWT>;

describe("optionalAuthMiddleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            headers: {},
        };
        
        mockRes = {};
        
        mockNext = jest.fn();
    });

    it("ajoute account à la requête quand le token est valide", async () => {
        const accountId = "acc_01FZACCOUNT123456789";
        const account = {
            id: accountId,
            username: "john_doe",
            displayName: "John Doe",
            description: "Developer",
            private: false,
            profileCompleted: true,
            admin: false,
        };

        mockReq.headers = {
            authorization: "Bearer valid_token",
        };

        mockedGetToken.mockReturnValue("valid_token");
        mockedVerifyJWT.mockReturnValue({ id: accountId } as any);
        mockedAuthenticateUser.mockResolvedValue(account as any);

        await optionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockedGetToken).toHaveBeenCalledWith(mockReq);
        expect(mockedVerifyJWT).toHaveBeenCalledWith("valid_token");
        expect(mockedAuthenticateUser).toHaveBeenCalledWith(accountId);
        expect((mockReq as any).account).toEqual(account);
        expect(mockNext).toHaveBeenCalledWith();
    });

    it("continue sans account quand aucun token n'est fourni", async () => {
        mockedGetToken.mockReturnValue(null);

        await optionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect((mockReq as any).account).toBeUndefined();
    });

    it("continue sans account quand le token est invalide", async () => {
        mockReq.headers = {
            authorization: "Bearer invalid_token",
        };

        mockedGetToken.mockReturnValue("invalid_token");
        mockedVerifyJWT.mockReturnValue(null);

        await optionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect((mockReq as any).account).toBeUndefined();
    });

    it("continue sans account quand l'utilisateur n'existe pas", async () => {
        mockReq.headers = {
            authorization: "Bearer valid_token",
        };

        mockedGetToken.mockReturnValue("valid_token");
        mockedVerifyJWT.mockReturnValue({ id: "acc_unknown" } as any);
        mockedAuthenticateUser.mockResolvedValue(null);

        await optionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect((mockReq as any).account).toBeUndefined();
    });

    it("continue sans account quand une erreur se produit", async () => {
        mockReq.headers = {
            authorization: "Bearer valid_token",
        };

        mockedGetToken.mockReturnValue("valid_token");
        mockedVerifyJWT.mockImplementation(() => {
            throw new Error("JWT error");
        });

        await optionalAuthMiddleware(mockReq as Request, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect((mockReq as any).account).toBeUndefined();
    });
});
