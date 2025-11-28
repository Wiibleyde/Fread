import { saveFileToDisk } from "@/lib/utils/file.util";
import type { AccountCreationInterface } from "../interfaces/account.interface";
import { AccountUpdateSchema } from "../models/account.model";
import { updateAccountCreationDB } from "../queries/account.queries";
import { createFileDB } from "../queries/file.queries";

export async function completeAccountCreation(
    accountId: string,
    data: FormData,
) {
    const username = data.get("username")?.toString().trim();
    const file = data.get("file") as File | null;

    const parsed = AccountUpdateSchema.safeParse({ username, file });
    if (!parsed.success) {
        throw new Error("Invalid data");
    }

    const updateData: AccountCreationInterface = {
        displayName: parsed.data.username,
        profileCompleted: true,
    };

    // File saving + DB insert
    if (parsed.data.file && parsed.data.file.size > 0) {
        const fileName = await saveFileToDisk(parsed.data.file);
        const createdFile = await createFileDB(accountId, fileName);
        updateData.profilePictureId = createdFile.id;
    }

    // Update the account
    await updateAccountCreationDB(accountId, updateData);

    return { success: true };
}
