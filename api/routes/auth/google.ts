import express from "express";
import type { GoogleUser } from "../../models/account.model";
import { getAccountByUsernameDB } from "../../services/account.service";
import { buildAuthUrl, createUser, getAccessTokenFromCallback, getCodeFromCallback, getUserInfo } from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";

const googleRouter = express.Router();

googleRouter.get("/", (_req, res) => {
    res.redirect(buildAuthUrl("google"));
});

googleRouter.get("/callback", async (req, res) => {
    const code = getCodeFromCallback(req, res);

    try {

        const { access_token } = await getAccessTokenFromCallback("google", code);

        const userDatas = await getUserInfo("google", access_token, "Bearer") as GoogleUser;

        let account = await getAccountByUsernameDB(userDatas.email);

        if (!account) {
            account = await createUser("google", userDatas);
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
