import type { Router } from "express";
import type { RouteDescriptor } from "../models/route.model";
import { Logger } from "../utils/logger";

export function registerRoutes(
    router: Router,
    routes: RouteDescriptor[]
) {

    const logger = Logger.here();

    routes.forEach(route => {
        logger.debug(`Registering route [${route.method.toUpperCase()}] ${route.path}`);
        router[route.method](
            route.path,
            ...(route.middlewares ?? []),
            route.handler
        );
    });
}
