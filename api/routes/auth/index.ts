import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createAuthRoutes from "./auth.route";

const authRouter = express.Router();

registerRoutes(authRouter, createAuthRoutes("discord"));
registerRoutes(authRouter, createAuthRoutes("google"));

export default authRouter;
