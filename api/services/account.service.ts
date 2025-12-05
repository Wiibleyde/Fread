import { prisma } from "../prisma";

interface CreateAccountData {
    username: string;
    displayName: string;
    description?: string | null;
    private?: boolean;
    profilePictureId?: string | null;
    appleId?: string | null;
    googleId?: string | null;
    discordId?: string | null;
    profileCompleted: boolean;
}

export const createUserDB = (data: CreateAccountData) => {
    return prisma.account.create({
        data,
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