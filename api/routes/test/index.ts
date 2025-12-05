import express from "express";
import { authMiddleware } from "../../middleware/auth";

const testRouter = express.Router();

testRouter.get("/", authMiddleware, (req, res) => {
    const user = (req as any).user;
    console.log("Authenticated user:", user);
    res.json({ message: user ? "Authenticated" : "Not Authenticated" });
});

export default testRouter;
