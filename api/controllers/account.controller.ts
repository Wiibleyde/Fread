import type { Request, Response } from "express";
import { getAccountByIdDB } from "../services/account.service";
import { getProfilePictureByProfileForIdDB } from "../services/file.service";

class AccountController {

    getProfile = async (req: Request, res: Response) => {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        const account = await getAccountByIdDB(id);
        const profilePicture = await getProfilePictureByProfileForIdDB(id);
        // Logic to retrieve account profile by ID
        res.json({ account: { ...account, ...profilePicture } });
    }

}

export default AccountController;