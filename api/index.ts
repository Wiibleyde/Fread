// Ce n'est que des tests pour l'instant le code est à revoir complètement

import express from "express";
import { env } from "./env";
import type { DiscordUser } from "./models/discordUser";
import { createUserDB, getUserByUsernameDB } from "./services/account.service";
import { generateJWT } from "./utils/jwt";

const app = express();
app.use(express.json());

app.get("/status", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/auth/discord", (req, res) => {
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${env.AUTH_DISCORD_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}&scope=identify+email`;
    res.redirect(discordAuthUrl);
});

app.get("/auth/discord/callback", async (req, res) => {
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

        let user = await getUserByUsernameDB(userDatas.username);

        if (!user) {
            user = await createUserDB({
                discordId: userDatas.id,
                username: userDatas.username,
                profileCompleted: false,
                description: "",
                displayName: userDatas.global_name || userDatas.username,
            });
        }

        const jwtToken = generateJWT(user);

        res.json({ token: jwtToken });
    } catch (err: any) {
        console.error(err);
        res.status(500).send(err.message || "Failed to authenticate");
    }
});

app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
});
