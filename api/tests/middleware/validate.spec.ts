import { validateBody, validateParams, validateQuery } from "../../middleware/validate";
import { z } from "zod";
import BadRequestError from "../../errors/badrequest.error";
import type { Request, Response, NextFunction } from "express";

describe("validate middleware", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            body: {},
            params: {},
            query: {},
        };
        
        mockRes = {};
        
        mockNext = jest.fn();
    });

    describe("validateBody", () => {
        const schema = z.object({
            username: z.string().min(3),
            age: z.number().optional(),
        });

        it("valide et transforme le body quand les données sont correctes", () => {
            mockReq.body = {
                username: "john_doe",
                age: 25,
            };

            const middleware = validateBody(schema, "body");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.body).toEqual({
                username: "john_doe",
                age: 25,
            });
        });

        it("retourne BadRequestError quand les données sont invalides", () => {
            mockReq.body = {
                username: "ab", // Trop court (min 3)
            };

            const middleware = validateBody(schema, "body");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });

        it("retourne BadRequestError avec le message d'erreur Zod", () => {
            mockReq.body = {
                username: "ab",
            };

            const middleware = validateBody(schema, "body");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            const error = (mockNext as jest.Mock).mock.calls[0][0];
            expect(error).toBeInstanceOf(BadRequestError);
            expect(error.message).toContain("Too small");
        });
    });

    describe("validateParams", () => {
        const schema = z.object({
            id: z.string().regex(/^acc_/),
        });

        it("valide et transforme les params quand les données sont correctes", () => {
            mockReq.params = {
                id: "acc_01FZACCOUNT123456789",
            };

            const middleware = validateParams(schema, "params");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.params).toEqual({
                id: "acc_01FZACCOUNT123456789",
            });
        });

        it("retourne BadRequestError quand le param ne match pas le pattern", () => {
            mockReq.params = {
                id: "invalid_id",
            };

            const middleware = validateParams(schema, "params");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });

    describe("validateQuery", () => {
        const schema = z.object({
            page: z.string().optional(),
            limit: z.string().optional(),
        });

        it("valide et transforme la query quand les données sont correctes", () => {
            mockReq.query = {
                page: "1",
                limit: "10",
            };

            const middleware = validateQuery(schema, "query");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith();
            expect(mockReq.query).toEqual({
                page: "1",
                limit: "10",
            });
        });

        it("retourne BadRequestError quand la query contient un champ inattendu", () => {
            const strictSchema = z.object({
                page: z.string(),
            }).strict();

            mockReq.query = {
                page: "1",
                unexpected: "value",
            };

            const middleware = validateQuery(strictSchema, "query");
            middleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        });
    });
});
