import { z } from "zod";

export const idParamSchema = z.object({
    id: z.string({ error: "ID parameter is required and must be a valid CUID" }).cuid("ID parameter is required and must be a valid CUID"),
}).strict();

export type IdParams = z.infer<typeof idParamSchema>;
