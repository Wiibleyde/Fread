import express from "express";
import { registerRoutes } from "../../builder/routeRegister";
import createAccountRoutes from "./account.route";

const accountRouter = express.Router();

registerRoutes(accountRouter, createAccountRoutes());

export default accountRouter;