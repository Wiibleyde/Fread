import FollowController from "../../controllers/follow.controller";
import { authMiddleware } from "../../middleware/auth";
import { validateParams } from "../../middleware/validate";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";
import { idParamSchema } from "../../schemas/common";

const createFollowRoutes = (): RouteDescriptor[] => {

    const controller = new FollowController();
    const prefix = "/follow";

    return [
        {
            method: "post",
            path: `${prefix}/:id`,
            middlewares: [
                authMiddleware,
                validateParams(idParamSchema, "params")
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.followAccount(req as AuthenticatedRequest);
                res.status(201).json(result);
            }),
        },
        {
            method: "delete",
            path: `${prefix}/:id`,
            middlewares: [
                authMiddleware,
                validateParams(idParamSchema, "params")
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.unfollowAccount(req as AuthenticatedRequest);
                res.json(result);
            }),
        }
    ];
};

export default createFollowRoutes;