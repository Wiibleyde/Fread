import FollowController from "../../controllers/follow.controller";
import { authMiddleware } from "../../middleware/auth";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createFollowRoutes = (): RouteDescriptor[] => {

    const controller = new FollowController();

    return [
        {
            method: "post",
            path: "/:id",
            middlewares: [
                authMiddleware
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.followAccount(req as AuthenticatedRequest);
                res.status(201).json(result);
            }),
        },
        {
            method: "delete",
            path: "/:id",
            middlewares: [
                authMiddleware
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.unfollowAccount(req as AuthenticatedRequest);
                res.json(result);
            }),
        }
    ];
};

export default createFollowRoutes;