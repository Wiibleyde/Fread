import express from "express";
import type { DiscordUser } from "../../models/account.model";
import { prisma } from "../../prisma";
import {
    createAccountDB,
    getAccountByUsernameDB,
} from "../../services/account.service";
import { createFileDB } from "../../services/file.service";
import { buildAuthUrl, getAccessTokenFromCallback, getCodeFromCallback } from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";

const discordRouter = express.Router();

discordRouter.get("/", (_req, res) => {
    res.redirect(buildAuthUrl("discord"));
});

discordRouter.get("/callback", async (req, res) => {
    const code = getCodeFromCallback(req, res);

    try {

        const { access_token, token_type } = await getAccessTokenFromCallback("discord", code);

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
            let avatarUrl = "";
            if (userDatas.avatar) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${userDatas.id}/${userDatas.avatar}.png`;
            }
            const avatar = await createFileDB(account.id, avatarUrl);
            await prisma.account.update({
                where: { id: account.id },
                data: { profilePictureId: avatar.id },
            });
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
