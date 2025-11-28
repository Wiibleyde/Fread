import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const saveFileToDisk = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filesDir = path.join(process.cwd(), "public", "files");
    mkdirSync(filesDir, { recursive: true });

    const extension = file.name.split(".").pop();
    const storedName = `${randomUUID()}.${extension}`;
    const storedPath = path.join(filesDir, storedName);
    writeFileSync(storedPath, buffer);

    const publicUrl = `/files/${storedName}`;
    return publicUrl;
};
