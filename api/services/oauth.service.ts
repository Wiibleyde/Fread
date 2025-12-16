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

export const getAccessTokenFromCallback = async (provider: "discord" | "google", code: string): Promise<{ access_token: string; token_type: string }> => {

    let tokenResponse: globalThis.Response;

    if (provider === "discord") {
        tokenResponse = await fetch(
            "https://discord.com/api/oauth2/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: env.AUTH_DISCORD_ID,
                    client_secret: env.AUTH_DISCORD_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: env.DISCORD_REDIRECT_URI,
                }),
            },
        );
    } else if (provider === "google") {
        tokenResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: env.AUTH_GOOGLE_ID,
                    client_secret: env.AUTH_GOOGLE_SECRET,
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: env.GOOGLE_REDIRECT_URI,
                }),
            },
        );
    } else {
        throw new Error("Unsupported provider");
    }

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token request failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    const { access_token, token_type } = tokenData as { access_token: string; token_type: string };

    return { access_token, token_type };
}