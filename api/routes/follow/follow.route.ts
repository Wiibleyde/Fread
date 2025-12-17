import FollowController from "../../controllers/follow.controller";
import { authMiddleware } from "../../middleware/auth";
import type { RouteDescriptor } from "../../models/route.model";

const createFollowRoutes = (): RouteDescriptor[] => {

    const controller = new FollowController();

    return [
        {
            method: "post",
            path: "/:id",
            handler: controller.followAccount,
            middlewares: [
                authMiddleware
            ]
        }
    ];
};

export default createFollowRoutes;