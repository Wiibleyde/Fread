import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createStatusRoutes from "./status.route";

const statusRouter = express.Router();

registerRoutes(statusRouter, createStatusRoutes());

export default statusRouter;