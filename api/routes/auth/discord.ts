import express from "express";
import { env } from "../../env";
import type { DiscordUser } from "../../models/account.model";
import {
    createAccountDB,
    getAccountByUsernameDB,
} from "../../services/account.service";
import { generateJWT } from "../../utils/jwt";
import { createFileDB } from "../../services/file.service";
import { prisma } from "../../prisma";

const discordRouter = express.Router();

discordRouter.get("/", (_req, res) => {
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${env.AUTH_DISCORD_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}&scope=identify+email`;
    res.redirect(discordAuthUrl);
});

discordRouter.get("/callback", async (req, res) => {
    const code = req.query.code as string;

    if (!code) return res.status(400).send("Code missing");

    try {
        // Échanger le code contre un access token
        const tokenResponse = await fetch(
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

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token request failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        
        const { access_token, token_type } = tokenData;

        // Récupérer les infos de l'utilisateur
        const userResponse = await fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `${token_type} ${access_token}`,
            },
        });

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            throw new Error(`User info request failed: ${errorText}`);
        }

        const userDatas = (await userResponse.json()) as DiscordUser;

        console.log("Discord user data:", userDatas);

        let account = await getAccountByUsernameDB(userDatas.username);

        if (!account) {
            account = await createAccountDB({
                discordId: userDatas.id,
                username: userDatas.username,
                profileCompleted: false,
                description: "",
                displayName: userDatas.global_name || userDatas.username,
            });

            // fetch la photo de profil et la stocker si elle existe
            if (userDatas.avatar) {
                const avatarUrl = `https://cdn.discordapp.com/avatars/${userDatas.id}/${userDatas.avatar}.png`;
                const avatar = await createFileDB(account.id, avatarUrl);
                await prisma.account.update({
                    where: { id: account.id },
                    data: { profilePictureId: avatar.id },
                });
            }
        }

        const jwtToken = generateJWT(account);

        res.json({ token: jwtToken });
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).send(message || "Failed to authenticate");
    }
});

export default discordRouter;
