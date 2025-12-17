import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createFollowRoutes from "./follow.route";

const followRouter = express.Router();

registerRoutes(followRouter, createFollowRoutes());

export default followRouter;