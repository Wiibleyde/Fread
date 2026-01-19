import FollowController from "../../controllers/follow.controller";
import { authMiddleware } from "../../middleware/auth";
import { validateParams } from "../../middleware/validate";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import { idParamSchema } from "../../schemas/common";
import asyncHandler from "../../utils/handler";

const createFollowRoutes = (): RouteDescriptor[] => {
	const controller = new FollowController();
	const prefix = "/follow";

	return [
		{
			method: "post",
			path: `${prefix}/:id`,
			middlewares: [authMiddleware, validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.followAccount(
					req as AuthenticatedRequest,
				);
				res.status(201).json(result);
			}),
		},
		{
			method: "delete",
			path: `${prefix}/:id`,
			middlewares: [authMiddleware, validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.unfollowAccount(
					req as AuthenticatedRequest,
				);
				res.json(result);
			}),
		},
		{
			method: "get",
			path: `${prefix}/:id/followers`,
			middlewares: [validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getFollowers(req);
				res.json(result);
			}),
		},
		{
			method: "get",
			path: `${prefix}/:id/followed`,
			middlewares: [validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getFollowed(req);
				res.json(result);
			}),
		},
	];
};

export default createFollowRoutes;
