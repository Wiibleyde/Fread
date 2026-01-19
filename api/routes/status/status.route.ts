import StatusController from "../../controllers/status.controller";
import type { RouteDescriptor } from "../../models/route.model";
import asyncHandler from "../../utils/handler";

const createStatusRoutes = (): RouteDescriptor[] => {

    const controller = new StatusController();

    const prefix = "/status";

    return [
        {
            method: "get",
            path: `${prefix}`,
            handler: asyncHandler(async (req, res) => {
                const result = await controller.getStatus(req);
                res.json(result);
            })
        }
    ];
}

export default createStatusRoutes;