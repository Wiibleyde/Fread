import AccountController from "../../controllers/account.controller";
import { authMiddleware } from "../../middleware/auth";
import type { RouteDescriptor } from "../../models/route.model";

const createAccountRoutes = (): RouteDescriptor[] => {
    const controller = new AccountController();

    return [
        {
            method: "get",
            path: "/:id",
            handler: controller.getProfile,
        },
        {
            method: "delete",
            path: "/:id",
            handler: controller.deleteAccount,
            middlewares: [
                authMiddleware
            ]
        }
    ];


};

export default createAccountRoutes;