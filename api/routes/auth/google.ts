import express from "express";
import type { GoogleUser } from "../../models/account.model";
import { prisma } from "../../prisma";
import {
    createAccountDB,
    getAccountByUsernameDB,
} from "../../services/account.service";
import { createFileDB } from "../../services/file.service";
import { buildAuthUrl, getAccessTokenFromCallback, getCodeFromCallback, getUserInfo } from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";

const googleRouter = express.Router();

googleRouter.get("/", (_req, res) => {
    res.redirect(buildAuthUrl("google"));
});

googleRouter.get("/callback", async (req, res) => {
    const code = getCodeFromCallback(req, res);

    try {

        const { access_token } = await getAccessTokenFromCallback("google", code);

        const userDatas= await getUserInfo("google", access_token, "Bearer") as GoogleUser;

        console.log("Google user data:", userDatas);

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
