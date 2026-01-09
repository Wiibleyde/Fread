import type { Request } from "express";
import InternalError from "../errors/internal.error";
import { getAccountByUsernameDB } from "../services/account.service";
import {
    buildAuthUrl,
    createUser,
    getAccessTokenFromCallback,
    getCodeFromCallback,
    getUserInfo,
} from "../services/oauth.service";
import { generateJWT } from "../utils/jwt";
import { Logger } from "../utils/logger";

const logger = Logger.for(import.meta.url);


class AuthController {
    private provider: "discord" | "google";

    constructor(provider: "discord" | "google") {
        this.provider = provider;
    }

    redirect = () => {
        logger.info("Building auth URL");
        return buildAuthUrl(this.provider);
    };

    callback = async (req: Request) => {
        const code = getCodeFromCallback(req);

        try {
            const { access_token, token_type } =
                await getAccessTokenFromCallback(this.provider, code);

            const userDatas = await getUserInfo(
                this.provider,
                access_token,
                token_type,
            );

            let account = await getAccountByUsernameDB(userDatas.username);

            if (!account) {
                logger.info("Creating new account from OAuth profile");
                account = await createUser(userDatas);
            }

            const jwtToken = generateJWT(account);
            logger.info("Generated JWT token for OAuth user");

            return { token: jwtToken };
        } catch (error) {
            logger.error("Authentication failed");
            // Ne pas renvoyer le message interne au client pour éviter leaks
            throw new InternalError();
        }
    };
}

export default AuthController;
