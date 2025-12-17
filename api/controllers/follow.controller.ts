import type { Response } from "express";
import type { AuthenticatedRequest } from "../models/auth.model";
import { followAccountDB, unfollowAccount } from "../services/follow.service";

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

        try {
            await followAccountDB(account.id, idToFollow);
            res.json({ message: `Successfully followed account with ID: ${idToFollow}` });
        } catch (error) {
            console.error("Error following account:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    unfullowAccount = async (req: AuthenticatedRequest, res: Response) => {
        const account = req.account;
        const idToUnfollow = req.params.id;

        if (!idToUnfollow) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        if (!account) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (account.id === idToUnfollow) {
            return res.status(400).json({ error: "Cannot unfollow yourself" });
        }

        try {
            await unfollowAccount(account.id, idToUnfollow);
            res.json({ message: `Successfully unfollowed account with ID: ${idToUnfollow}` });
        } catch (error) {
            console.error("Error unfollowing account:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

}

export default FollowController;