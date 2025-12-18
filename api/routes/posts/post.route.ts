import PostController from "../../controllers/post.controller";
import { authMiddleware } from "../../middleware/auth";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createPostRoutes = (): RouteDescriptor[] => {

    const controller = new PostController();

    return [
        {
            method: "post",
            path: "/",
            middlewares: [
                authMiddleware
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.createPost(req as AuthenticatedRequest);
                res.status(201).json(result);
            })
        }
    ];
}

export default createPostRoutes;