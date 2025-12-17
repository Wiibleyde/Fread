import type { Router } from "express";
import type { RouteDescriptor } from "../models/route.model";

export function registerRoutes(
    router: Router,
    routes: RouteDescriptor[]
) {
    routes.forEach(route => {
        console.log(`Registering route [${route.method.toUpperCase()}] ${route.path}`);
        router[route.method](
            route.path,
            ...(route.middlewares ?? []),
            route.handler
        );
    });
}
