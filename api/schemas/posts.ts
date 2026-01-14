import { z } from "zod";

export const postCreateSchema = z.object({
    token: z.string().min(1, "Token is required"),
    content: z.string().min(1, "Content is required"),
    isPrivate: z.boolean().optional(),
}).strict();

export const postEditSchema = z.object({
    token: z.string().min(1, "Token is required"),
    content: z.string().min(1, "Content cannot be empty").optional(),
}).strict().refine(obj => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
});

export const replyCreateSchema = z.object({
    token: z.string().min(1, "Token is required"),
    content: z.string().min(1, "Content is required"),
}).strict();

export type PostCreateBody = z.infer<typeof postCreateSchema>;
export type PostEditBody = z.infer<typeof postEditSchema>;
export type ReplyCreateBody = z.infer<typeof replyCreateSchema>;
