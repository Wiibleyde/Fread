import express from "express";
import { authMiddleware } from "../../middleware/auth";
import type { AuthenticatedRequest } from "../../models/auth.model";

const testRouter = express.Router();

testRouter.get("/", authMiddleware, (req: AuthenticatedRequest, res) => {
    const account = req.account;
    const { id } = req.body;
    console.log("Requested ID:", id);
    console.log("Authenticated user:", account);
    res.json({ message: account ? "Authenticated" : "Not Authenticated" });
});

export default testRouter;
