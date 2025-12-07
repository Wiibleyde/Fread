import express from "express";
import { authMiddleware } from "../../middleware/auth";
import type { AuthenticatedRequest } from "../../models/auth.model";

const testRouter = express.Router();

testRouter.get("/", authMiddleware, (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { id } = req.body;
    console.log("Requested ID:", id);
    console.log("Authenticated user:", user);
    res.json({ message: user ? "Authenticated" : "Not Authenticated" });
});

export default testRouter;
