import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    AUTH_DISCORD_ID: z.string().min(1, 'AUTH_DISCORD_ID is required'),
    AUTH_DISCORD_SECRET: z.string().min(1, 'AUTH_DISCORD_SECRET is required'),
    DISCORD_REDIRECT_URI: z.string().url('DISCORD_REDIRECT_URI must be a valid URL'),
});

const _env = envSchema.parse(process.env);

export const env = _env;