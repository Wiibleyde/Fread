import PostController from "../../controllers/post.controller";
import { authMiddleware } from "../../middleware/auth";
import { optionalAuthMiddleware } from "../../middleware/optional-auth";
import { validateBody, validateParams } from "../../middleware/validate";
import type { AuthenticatedRequest } from "../../models/auth.model";
import type { RouteDescriptor } from "../../models/route.model";
import { idParamSchema } from "../../schemas/common";
import {
	postCreateSchema,
	postEditSchema,
	replyCreateSchema,
} from "../../schemas/posts";
import asyncHandler from "../../utils/handler";

const createPostRoutes = (): RouteDescriptor[] => {
	const controller = new PostController();
	const prefix = "/post";

	return [
		{
			method: "get",
			path: `${prefix}/feed`,
			middlewares: [optionalAuthMiddleware],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getFeed(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
		{
			method: "post",
			path: `${prefix}/`,
			middlewares: [authMiddleware, validateBody(postCreateSchema, "body")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.createPost(req as AuthenticatedRequest);
				res.status(201).json(result);
			}),
		},
		{
			method: "post",
			path: `${prefix}/:id/reply`,
			middlewares: [
				authMiddleware,
				validateParams(idParamSchema, "params"),
				validateBody(replyCreateSchema, "body"),
			],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.createReply(
					req as AuthenticatedRequest,
				);
				res.status(201).json(result);
			}),
		},
		{
			method: "get",
			path: `${prefix}/:id`,
			middlewares: [
				optionalAuthMiddleware,
				validateParams(idParamSchema, "params"),
			],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getPost(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
		{
			method: "get",
			path: `${prefix}/:id/replies`,
			middlewares: [
				optionalAuthMiddleware,
				validateParams(idParamSchema, "params"),
			],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.getReplies(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
		{
			method: "delete",
			path: `${prefix}/:id`,
			middlewares: [authMiddleware, validateParams(idParamSchema, "params")],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.deletePost(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
		{
			method: "patch",
			path: `${prefix}/:id`,
			middlewares: [
				authMiddleware,
				validateParams(idParamSchema, "params"),
				validateBody(postEditSchema, "body"),
			],
			handler: asyncHandler(async (req, res) => {
				const result = await controller.editPost(req as AuthenticatedRequest);
				res.json(result);
			}),
		},
	];
};

export default createPostRoutes;
