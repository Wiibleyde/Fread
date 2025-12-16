import { prisma } from "../prisma";

export const createFileDB = (accountId: string, fileName: string) => {
    return prisma.file.create({
        data: { fileName, accountId },
    });
}