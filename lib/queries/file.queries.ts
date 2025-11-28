import { prisma } from "@/lib/prisma";

export const createFileDB = (accountId: string, fileName: string) => {
    return prisma.file.create({
        data: { fileName, accountId },
    });
}

export const deleteFileDB = (fileId: string) => {
    return prisma.file.delete({
        where: { id: fileId },
    });
}