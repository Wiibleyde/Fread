import type { CreateAccountData } from "../models/account.model";
import { prisma } from "../prisma";

export const createUserDB = (data: CreateAccountData) => {
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

export const getUserByUsernameDB = (username: string) => {
    return prisma.account.findUnique({
        where: { username },
    });
}

export const getUserByIdDB = (id: string) => {
    return prisma.account.findUnique({
        where: { id },
    });
}