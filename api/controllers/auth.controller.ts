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

class AuthController {
    private provider: "discord" | "google";

    constructor(provider: "discord" | "google") {
        this.provider = provider;
    }

    redirect = () => {
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
                account = await createUser(userDatas);
            }

            const jwtToken = generateJWT(account);

            return { token: jwtToken };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            throw new InternalError(`Authentication failed: ${errorMessage}`);
        }
    };
}

export default AuthController;
