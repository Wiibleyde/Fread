import express from "express";
import type { DiscordUser } from "../../models/account.model";
import { getAccountByUsernameDB } from "../../services/account.service";
import { buildAuthUrl, createUser, getAccessTokenFromCallback, getCodeFromCallback, getUserInfo } from "../../services/oauth.service";
import { generateJWT } from "../../utils/jwt";

const discordRouter = express.Router();

discordRouter.get("/", (_req, res) => {
    res.redirect(buildAuthUrl("discord"));
});

discordRouter.get("/callback", async (req, res) => {
    const code = getCodeFromCallback(req, res);

    try {

        const { access_token, token_type } = await getAccessTokenFromCallback("discord", code);

        const userDatas = await getUserInfo("discord", access_token, token_type) as DiscordUser;
        
        let account = await getAccountByUsernameDB(userDatas.username);

        if (!account) {
            account = await createUser("discord", userDatas);
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
