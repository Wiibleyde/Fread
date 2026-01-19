import AccountController from "../../controllers/account.controller";
import { authMiddleware } from "../../middleware/auth";
import { optionalAuthMiddleware } from "../../middleware/optional-auth";
import { validateBody, validateParams } from "../../middleware/validate";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import { accountEditSchema } from "../../schemas/account";
import { idParamSchema } from "../../schemas/common";
import asyncHandler from "../../utils/handler";

const createAccountRoutes = (): RouteDescriptor[] => {
	const controller = new AccountController();
	const prefix = "/account";

	return [
		{
			method: "get",
			path: `${prefix}/:id`,
			middlewares: [validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getProfile(req);
				res.json(result);
			}),
		},
		{
			method: "delete",
			path: `${prefix}/:id`,
			middlewares: [authMiddleware, validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.deleteAccount(
					req as AuthenticatedRequest,
				);
				res.json(result);
			}),
		},
		{
			method: "get",
			path: `${prefix}/:id/posts`,
			middlewares: [
				optionalAuthMiddleware,
				validateParams(idParamSchema, "params"),
			],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getPosts(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
		{
			method: "patch",
			path: `${prefix}`,
			middlewares: [authMiddleware, validateBody(accountEditSchema, "body")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.editAccount(
					req as AuthenticatedRequest,
				);
				res.json(result);
			}),
		},
	];
};

export default createAccountRoutes;
