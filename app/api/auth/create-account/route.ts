import { NextResponse } from "next/server";
import { saveFileToDisk } from "@/lib/file";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
    const form = await req.formData();
    const username = String(form.get("username") ?? "").trim();
    const sessionStr = form.get("session");
    const file = form.get("file") as File | null;

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 },
        );
    }

    const session = sessionStr ? JSON.parse(sessionStr.toString()) : null;

    // Mettre à jour l'utilisateur dans la base de données avec le nom d'utilisateur fourni
    await prisma.account.update({
        where: { id: session?.user?.id },
        data: {
            displayName: username
        },
    });
    const currentUser = await prisma.account.findFirst({
        where: { id: session?.user?.id },
    });

    if (!currentUser) {
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
        );
    }

    if (file) {
        // Sauvegarde sur disque et récupère le nom original
        const fileName = await saveFileToDisk(file);
        const createdFile = await prisma.file.create({
            data: {
                fileName: fileName,
                accountId: session?.user?.id,
            },
        });

        await prisma.account.update({
            where: { id: session?.user?.id },
            data: { profilePictureId: createdFile.id },
        });
    }

    return NextResponse.json({ success: true });
}
