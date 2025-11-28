import { z } from "zod";

export const AccountUpdateSchema = z.object({
    username: z.string().min(2),
    file: z.instanceof(File).optional(),
});

export type AccountUpdate = z.infer<typeof AccountUpdateSchema>;
