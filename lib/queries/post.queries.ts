import { prisma } from "@/lib/prisma";

export async function getPostByUserIdDB(accountId: string) {
    return prisma.post.findMany({
        where: { accountId: accountId },
        orderBy: { creationDate: 'desc' },
    });
}