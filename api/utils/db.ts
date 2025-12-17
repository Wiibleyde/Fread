import { prisma } from "../prisma";

export const dbHealthCheck = async () => {
    try {
        // Requête de test simple pour vérifier que la base de données répond
        await prisma.$queryRaw`SELECT 1`;
        console.log("🔌 Database is on API is now starting...");
    } catch (_error) {
        console.log("⚠️ Database connection failed, API cannot start exiting...");
        process.exit(1);
    }
}