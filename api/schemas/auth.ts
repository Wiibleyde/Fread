import { z } from "zod";

export const authCallbackQuerySchema = z.object({
    code: z.string({ error: "Code missing from callback query" }).min(1, "Code missing from callback query"),
}).strict();

export type AuthCallbackQuery = z.infer<typeof authCallbackQuerySchema>;
