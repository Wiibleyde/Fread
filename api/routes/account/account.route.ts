import AccountController from "../../controllers/account.controller";
import { authMiddleware } from "../../middleware/auth";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createAccountRoutes = (): RouteDescriptor[] => {
    const controller = new AccountController();

    return [
        {
            method: "get",
            path: "/:id",
            handler: asyncHandler(async (req, res) => {
                const result = await controller.getProfile(req);
                res.json(result);
            }),
        },
        {
            method: "delete",
            path: "/:id",
            middlewares: [
                authMiddleware
            ],
            handler: asyncHandler(async (req, res) => {
                const result = await controller.deleteAccount(req);
                res.json(result);
            })
        },
        {
            method: "get",
            path: "/:id/posts",
            handler: asyncHandler(async (req, res) => {
                const result = await controller.getPosts(req);
                res.json(result);
            }),
        }
    ];


};

export default createAccountRoutes;