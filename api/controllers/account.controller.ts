import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.model";
import { deleteAccount, getAccountByIdDB } from "../services/account.service";

class AccountController {
    getProfile = async (req: Request, res: Response) => {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        const account = await getAccountByIdDB(id);

        res.json({ account });
    };

    deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        if (!account) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (account.id !== id) {
            return res.status(403).json({ error: "Forbidden" });
        }

        console.log(`Deleting account with ID: ${account.id}`);
        // Suppression des posts, likes, commmentaires, fichier et comptes de l'utilisateur
        try {
            await deleteAccount(account.id);
        } catch (error) {
            console.error("Error deleting account:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: "Account deleted successfully" });
    };
}

export default AccountController;
