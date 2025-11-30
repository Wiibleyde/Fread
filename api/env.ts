import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(0, 'JWT_SECRET must be at least 32 characters long'),
});

const _env = envSchema.parse(process.env);

export const env = _env;