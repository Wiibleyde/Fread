import { prisma } from "../prisma";
import { Logger } from "./logger";

const logger = Logger.for(import.meta.url);

export const dbHealthCheck = async () => {
    try {
        // Requête de test simple pour vérifier que la base de données répond
        await prisma.$queryRaw`SELECT 1`;
        logger.info("🔌 Database connection successful, API can start...");
    } catch (_error) {
        logger.error("⚠️ Database connection failed, API cannot start exiting...");
        process.exit(1);
    }
}