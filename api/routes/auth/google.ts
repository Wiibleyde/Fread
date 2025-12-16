import express from "express";
import { env } from "../../env";
import type { GoogleUser } from "../../models/account.model";
import { prisma } from "../../prisma";
import {
    createAccountDB,
    getAccountByUsernameDB,
} from "../../services/account.service";
import { createFileDB } from "../../services/file.service";
import { buildAuthUrl, getCodeFromCallback } from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";

const googleRouter = express.Router();

googleRouter.get("/", (_req, res) => {
    res.redirect(buildAuthUrl("google"));
});

googleRouter.get("/callback", async (req, res) => {
    const code = getCodeFromCallback(req, res);

    try {
        // Échanger le code contre un access_token + id_token
        const tokenResponse = await fetch(
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

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token request failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        // Récupérer les infos user depuis Google
        const userResponse = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            },
        );

        if (!userResponse.ok) {
            const errorText = await userResponse.text();
            throw new Error(`User info failed: ${errorText}`);
        }

        const userDatas = (await userResponse.json()) as GoogleUser;

        let account = await getAccountByUsernameDB(userDatas.email);

        if (!account) {
            account = await createAccountDB({
                googleId: userDatas.sub,
                username: userDatas.email,
                profileCompleted: false,
                description: "",
                displayName: userDatas.name || userDatas.email,
            });

            const picture = await createFileDB(
                account.id,
                userDatas.picture || "",
            );
            await prisma.account.update({
                where: { id: account.id },
                data: { profilePictureId: picture.id },
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

export default googleRouter;
