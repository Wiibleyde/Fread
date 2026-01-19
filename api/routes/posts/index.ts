import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createPostRoutes from "./post.route";

const postRouter = express.Router();

registerRoutes(postRouter, createPostRoutes());

export default postRouter;