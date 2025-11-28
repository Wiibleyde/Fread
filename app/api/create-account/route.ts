import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveFileToDisk } from "@/lib/file";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const username = formData.get("username")?.toString().trim();
    const file = formData.get("file") as File | null;

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 },
        );
    }

    const updateData: {
        displayName: string;
        profileCompleted: boolean;
        profilePictureId?: string;
    } = {
        displayName: username,
        profileCompleted: true,
    };

    if (file && file.size > 0) {
        const fileName = await saveFileToDisk(file);
        const createdFile = await prisma.file.create({
            data: {
                fileName: fileName,
                accountId: session.user.id,
            },
        });
        updateData.profilePictureId = createdFile.id;
    }

    await prisma.account.update({
        where: { id: session.user.id },
        data: updateData,
    });

    return NextResponse.json({ success: true });
}
