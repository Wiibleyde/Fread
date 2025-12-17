import type { Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.model";

class FollowController {
    followAccount = async (req: AuthenticatedRequest, res: Response) => {
        const account = req.account;
        const idToFollow = req.params.id;

        if (!idToFollow) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        if (!account) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (account.id === idToFollow) {
            return res.status(400).json({ error: "Cannot follow yourself" });
        }

        res.json({ message: `Account with ID: ${account.id} followed account with ID: ${idToFollow}` });

    }

}

export default FollowController;