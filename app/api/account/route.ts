import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { completeAccountCreation, deleteAccountService } from "@/lib/services/account.service";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const result = await completeAccountCreation(session.user.id, formData);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 400 }
        );
    }
}


export async function DELETE() {
    const session = await auth();
    console.log("Delete account request for user:", session?.user?.id);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await deleteAccountService(session.user.id);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Something went wrong" },
            { status: 400 }
        );
    }
}