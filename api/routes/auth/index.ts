import express from "express";
import discordRouter from "./discord";
import googleRouter from "./google";

const authRouter = express.Router();

authRouter.use("/discord", discordRouter);
authRouter.use("/google", googleRouter);

export default authRouter;