import type { Request, Response } from "express";
import { env } from "../env";
import type { DiscordUser, GoogleUser } from "../models/account.model";
import type { Account } from "../generated/prisma/client";
import { createAccountDB } from "./account.service";
import { prisma } from "../prisma";
import { createFileDB } from "./file.service";

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

export const getUserInfo = async (provider: "discord" | "google", access_token: string, token_type: string): Promise<DiscordUser | GoogleUser> => {
    let userResponse: globalThis.Response;

    if (provider === "discord") {
        userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `${token_type} ${access_token}`,
            },
        });
    } else if (provider === "google") {
        userResponse = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            },
        );
    } else {
        throw new Error("Unsupported provider");
    }

    if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`User info failed: ${errorText}`);
    }

    const userDatas = await userResponse.json();

    return userDatas as DiscordUser | GoogleUser;
}

export const createUser = async (provider: "discord" | "google", userDatas: DiscordUser | GoogleUser): Promise<Account> => {
    let account: Account;
    if (provider === "discord") {
        const userDiscord = userDatas as DiscordUser;
        account = await createAccountDB({
            discordId: userDiscord.id,
            username: userDiscord.username,
            profileCompleted: false,
            description: "",
            displayName: userDiscord.global_name || userDiscord.username,
        });

        // fetch la photo de profil et la stocker si elle existe
        let avatarUrl = "";
        if (userDiscord.avatar) {
            avatarUrl = `https://cdn.discordapp.com/avatars/${userDiscord.id}/${userDiscord.avatar}.png`;
        }
        const avatar = await createFileDB(account.id, avatarUrl);
        await prisma.account.update({
            where: { id: account.id },
            data: { profilePictureId: avatar.id },
        });
    } else if (provider === "google") {
        const userGoogle = userDatas as GoogleUser;
        account = await createAccountDB({
            googleId: userGoogle.sub,
            username: userGoogle.email,
            profileCompleted: false,
            description: "",
            displayName: userGoogle.name || userGoogle.email,
        });

        const picture = await createFileDB(
            account.id,
            userGoogle.picture || "",
        );
        await prisma.account.update({
            where: { id: account.id },
            data: { profilePictureId: picture.id },
        });
    } else {
        throw new Error("Unsupported provider");
    }

    return account;
}