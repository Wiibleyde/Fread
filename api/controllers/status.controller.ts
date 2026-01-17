import type { Request } from "express";
import { Logger } from "../utils/logger";

const logger = new Logger(import.meta.url);


class StatusController {
    getStatus = async (req: Request) => {
        logger.debug("Retrieving status");
        return {
            status: "ok",
            timestamp: new Date().toISOString()
        }
    }
}

export default StatusController;