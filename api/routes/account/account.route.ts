import AccountController from "../../controllers/account.controller";
import type { RouteDescriptor } from "../../models/route.model";

const createAccountRoutes = (): RouteDescriptor[] => {
    const controller = new AccountController();

    return [
        {
            method: "get",
            path: "/:id",
            handler: controller.getProfile,
        }
    ];


};

export default createAccountRoutes;