import { prisma } from "../prisma";

export const createFileDB = (accountId: string, fileName: string) => {
    return prisma.file.create({
        data: { fileName, accountId, profileForId: accountId },
    });
}

export const deleteFileDB = (fileId: string) => {
    return prisma.file.delete({
        where: { id: fileId },
    });
}

export const getFileByIdDB = (fileId: string) => {
    return prisma.file.findUnique({
        where: { id: fileId },
    });
}