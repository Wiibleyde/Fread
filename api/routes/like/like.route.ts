import LikeController from "../../controllers/like.controller";
import { authMiddleware } from "../../middleware/auth";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createLikeRoutes = (): RouteDescriptor[]  => {

    const controller = new LikeController();

    return [
        {
            method: "post",
            path: "/:id",
            middlewares: [
                authMiddleware
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.likePost(req);
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
                const result = await controller.unlikePost(req);
                res.status(200).json(result);
            })
        }
    ]
}

export default createLikeRoutes;