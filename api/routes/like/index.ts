import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createLikeRoutes from "./like.route";

const likeRouter = express.Router();
registerRoutes(likeRouter, createLikeRoutes());

export default likeRouter;