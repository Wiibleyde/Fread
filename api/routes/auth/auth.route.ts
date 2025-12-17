import AuthController from "../../controllers/auth.controller";
import type { RouteDescriptor } from "../../models/route.model";



export function createAuthRoutes(provider: "discord" | "google"): RouteDescriptor[] {
    const controller = new AuthController(provider);
    const basePath = `/${provider}`;

    return [
        {
            method: "get",
            path: `${basePath}`,
            handler: controller.redirect,
        },
        {
            method: "get",
            path: `${basePath}/callback`,
            handler: controller.callback,
        },
    ];
}
