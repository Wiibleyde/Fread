import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";
import BadRequestError from "../errors/badrequest.error";
import { Logger } from "../utils/logger";

const log = Logger.here();

function makeValidator(getPart: (req: Request) => unknown, setPart?: (req: Request, value: unknown) => void) {
    return (schema: ZodTypeAny, label: string): RequestHandler => {
        return (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(getPart(req));
            if (!result.success) {
                log.warn(`Invalid ${label}`);
                const first = result.error.issues?.[0];
                const message = first?.message || "Invalid input";
                return next(new BadRequestError(message));
            }
            if (setPart) setPart(req, result.data);
            next();
        };
    };
}

export const validateBody = makeValidator(
    (req) => req.body,
    (req, val) => { req.body = val as Record<string, unknown>; }
);

export const validateParams = makeValidator(
    (req) => req.params,
    (req, val) => { req.params = val as Record<string, string>; }
);

export const validateQuery = makeValidator(
    (req) => req.query,
    (req, val) => { req.query = val as Record<string, string>; }
);
