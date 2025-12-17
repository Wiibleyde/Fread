import type { Request, Response } from "express";
import { getAccountByUsernameDB } from "../services/account.service";
import {
    buildAuthUrl,
    createUser,
    getAccessTokenFromCallback,
    getCodeFromCallback,
    getUserInfo,
} from "../services/oauth.service";
import { generateJWT } from "../utils/jwt";

class AuthController {
    private provider: "discord" | "google";

    constructor(provider: "discord" | "google") {
        this.provider = provider;
    }

    redirect = (_req: Request, res: Response) => {
        res.redirect(buildAuthUrl(this.provider));
    };

    callback = async (req: Request, res: Response) => {
        const code = getCodeFromCallback(req, res);

        try {
            const { access_token, token_type } = await getAccessTokenFromCallback(
                this.provider,
                code,
            );

            const userDatas = await getUserInfo(
                this.provider,
                access_token,
                token_type,
            );

            let account = await getAccountByUsernameDB(userDatas.username);

            if (!account) {
                account = await createUser(userDatas);
            }

            const jwtToken = generateJWT(account);

            res.json({ token: jwtToken });
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : String(err);
            res.status(500).send(message || "Failed to authenticate");
        }
    };
}

export default AuthController;
