import express from "express";
import { env } from "../../env";
import type { GoogleUser } from "../../models/discordUser";
import {
    createUserDB,
    getUserByUsernameDB,
} from "../../services/account.service";
import { generateJWT } from "../../utils/jwt";

const googleRouter = express.Router();

googleRouter.get("/auth/google", (_req, res) => {
    const googleAuthUrl =
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id: env.AUTH_GOOGLE_ID,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            response_type: "code",
            scope: ["openid", "email", "profile"].join(" "),
            access_type: "offline",
            prompt: "consent",
        });

    res.redirect(googleAuthUrl);
});

googleRouter.get("/auth/google/callback", async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send("Code missing");
    }

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

        let user = await getUserByUsernameDB(userDatas.email);

        if (!user) {
            user = await createUserDB({
                googleId: userDatas.sub,
                username: userDatas.email,
                profileCompleted: false,
                description: "",
                displayName: userDatas.name || userDatas.email,
            });
        }

        const jwtToken = generateJWT(user);

        res.json({ token: jwtToken });
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).send(message || "Failed to authenticate");
    }
});

export default googleRouter;
