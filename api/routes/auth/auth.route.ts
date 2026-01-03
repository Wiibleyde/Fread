import AuthController from "../../controllers/auth.controller";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createAuthRoutes = (provider: "discord" | "google"): RouteDescriptor[] => {
    const controller = new AuthController(provider);
    const basePath = `/${provider}`;

    return [
        {
            method: "get",
            path: `${basePath}`,
            handler: asyncHandler(async (_req, res) => {
                const result = controller.redirect();
                res.status(200).json({ url: result });
            }),
        },
        {
            method: "get",
            path: `${basePath}/callback`,
            handler: asyncHandler(async (_req, res) => {
                const result = await controller.callback(_req);
                res.status(201).json(result);
            }),
        },
    ];
}

export default createAuthRoutes;