import type { CreateAccountData } from "../models/account.model";
import { prisma } from "../prisma";

export const createAccountDB = (data: CreateAccountData) => {
    return prisma.account.create({
        data: {
            username: data.username,
            displayName: data.displayName,
            description: data.description as string,
            private: data.private,
            profilePictureId: data.profilePictureId,
            appleId: data.appleId,
            googleId: data.googleId,
            discordId: data.discordId,
            profileCompleted: data.profileCompleted,
        }
    });
}

export const getAccountByUsernameDB = (username: string) => {
    return prisma.account.findUnique({
        where: { username },
    });
}

export const getAccountByIdDB = (id: string) => {
    return prisma.account.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            displayName: true,
            description: true,
            private: true,
            createdAt: true,
            profilePicture: {
                select: {
                    id: true,
                    fileName: true
                }
            },
            follows: { select: { followedAccountId: true } },
            followedBy: { select: { accountId: true } },
        }
    });
}

export const deleteAccount = (id: string) => {
    return prisma.account.delete({
        where: { id },
    });
}

interface EditAccountData {
    displayName?: string;
    description?: string | null;
    private?: boolean;
}

export const editAccountDb = (id: string, data: EditAccountData) => {
    return prisma.account.update({
        where: { id },
        data: {
            displayName: data.displayName,
            description: data.description || "",
            private: data.private,
        }
    });
}
