import { z } from "zod";

export const accountEditSchema = z.object({
    displayName: z.string().min(1, "Display name cannot be empty").optional(),
    description: z.string().max(512).nullable().optional(),
    isPrivate: z.boolean().optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
});

export type AccountEditBody = z.infer<typeof accountEditSchema>;
