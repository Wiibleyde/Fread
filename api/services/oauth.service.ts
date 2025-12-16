import type { Request, Response } from "express";
import { env } from "../env";

export const buildAuthUrl = (provider: "discord" | "google"): string => {
    switch (provider) {
        case "discord":
            return `https://discord.com/oauth2/authorize?client_id=${env.AUTH_DISCORD_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}&scope=identify+email`;
        case "google":
            return (
                "https://accounts.google.com/o/oauth2/v2/auth?" +
                new URLSearchParams({
                    client_id: env.AUTH_GOOGLE_ID,
                    redirect_uri: env.GOOGLE_REDIRECT_URI,
                    response_type: "code",
                    scope: ["openid", "email", "profile"].join(" "),
                    access_type: "offline",
                    prompt: "consent",
                }).toString()
            )
        default:
            throw new Error("Unsupported provider");
    }
}

export const getCodeFromCallback = (req: Request, res: Response): string => {
    const code = req.query.code as string;

    if (!code) {
        res.status(400).send("Code missing");
    }

    return code;
}