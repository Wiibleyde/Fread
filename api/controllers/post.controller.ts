import AppError from "../errors/AppError";
import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import NotFoundError from "../errors/notfound.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import type {
	PostCreateBody,
	PostEditBody,
	ReplyCreateBody,
} from "../schemas/posts";
import { isFollowing } from "../services/follow.service";
import {
	createPostDB,
	createReplyDB,
	deletePostByIdDb,
	editPostById,
	getFeedPosts,
	getPostById,
	getPostLikesCount,
	getPostRepliesCount,
	getRepliesForPost,
} from "../services/post.service";
import { Logger } from "../utils/logger";

const logger = Logger.for(import.meta.url);

class PostController {
	createPost = async (req: AuthenticatedRequest) => {
		const account = req.account;
		const { content, isPrivate } = req.body as PostCreateBody;

		try {
			logger.info("Creating post");
			await createPostDB(content, account.id, Boolean(isPrivate));
		} catch (error) {
			logger.error("Error creating post");
			throw new InternalError("Failed to create post", { created: false });
		}

		return { created: true, message: "Post created" };
	};

	getPost = async (req: AuthenticatedRequest) => {
		const id = req.params.id!;
		const account = req.account;

		try {
			logger.debug("Retrieving post");
			const post = await getPostById(id);

			if (!post) {
				logger.warn("Post not found");
				throw new NotFoundError("Post not found", { retrieved: false });
			}

			if (post.private) {
				if (account && post.accountId === account.id) {
					logger.debug("Post retrieved");

					return {
						retrieved: !!post,
						post: {
							...post,
							likesCount: await getPostLikesCount(post.id),
							repliesCount: await getPostRepliesCount(post.id),
						},
					};
				}

				if (
					account &&
					(await isFollowing(account.id, post.accountId)) &&
					(await isFollowing(post.accountId, account.id))
				) {
					logger.debug("Post retrieved");
					return {
						retrieved: !!post,
						post: {
							...post,
							likesCount: await getPostLikesCount(post.id),
							repliesCount: await getPostRepliesCount(post.id),
						},
					};
				}
				// connecté mais pas de follow -> error
				if (
					account &&
					(!(await isFollowing(account.id, post.accountId)) ||
						!(await isFollowing(post.accountId, account.id)))
				) {
					logger.warn("Not mutually following for private post");
					throw new UnauthorizedError(
						"You are not authorized to view this post",
						{ retrieved: false },
					);
				}

				// pas connecté -> error
				if (!account || post.accountId !== account.id) {
					logger.warn("Unauthenticated access to private post");
					throw new UnauthorizedError(
						"You are not authorized to view this post",
						{ retrieved: false },
					);
				}
			}

			return {
				retrieved: !!post,
				post: {
					...post,
					likesCount: await getPostLikesCount(post.id),
					repliesCount: await getPostRepliesCount(post.id),
				},
			};
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			logger.error("Error retrieving post");
			throw new InternalError("Failed to retrieve post", { retrieved: false });
		}
	};

	deletePost = async (req: AuthenticatedRequest) => {
		const account = req.account;
		const id = req.params.id!;

		const post = await getPostById(id);

		if (!post) {
			logger.warn("Post not found for deletion");
			throw new BadRequestError("Post not found", { deleted: false });
		}

		if (post.accountId !== account.id) {
			logger.warn("Unauthorized delete attempt for post");
			throw new UnauthorizedError(
				"You are not authorized to delete this post",
				{ deleted: false },
			);
		}

		try {
			logger.info("Deleting post");
			await deletePostByIdDb(id);
			return { deleted: true, message: "Post deleted" };
		} catch (error) {
			logger.error("Error deleting post");
			throw new InternalError("Failed to delete post", { deleted: false });
		}
	};

	editPost = async (req: AuthenticatedRequest) => {
		const account = req.account;
		const id = req.params.id!;
		const { content } = req.body as PostEditBody;

		const post = await getPostById(id);

		if (!post) {
			logger.warn("Post not found for editing");
			throw new BadRequestError("Post not found", { edited: false });
		}

		if (post.accountId !== account.id) {
			logger.warn("Unauthorized edit attempt for post");
			throw new UnauthorizedError("You are not authorized to edit this post", {
				edited: false,
			});
		}

		try {
			const updatedPost = await editPostById(
				id,
				content ?? post.content,
				post.private,
			);
			logger.info("Post edited successfully");
			return { edited: true, post: updatedPost };
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			logger.error("Error editing post");
			throw new InternalError("Failed to edit post", { edited: false });
		}
	};

	createReply = async (req: AuthenticatedRequest) => {
		const account = req.account;
		const id = req.params.id!;
		const { content } = req.body as ReplyCreateBody;

		try {
			const basePost = await getPostById(id);
			if (!basePost) {
				throw new NotFoundError("Post not found", { created: false });
			}

			if (basePost.private) {
				if (basePost.accountId === account.id) {
				} else {
					const aFollowsB = await isFollowing(account.id, basePost.accountId);
					const bFollowsA = await isFollowing(basePost.accountId, account.id);
					if (!(aFollowsB && bFollowsA)) {
						throw new UnauthorizedError(
							"You are not authorized to reply to this post",
							{ created: false },
						);
					}
				}
			}

			await createReplyDB(id, content, account.id, basePost.private);
			return { created: true, message: "Reply created" };
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			throw new InternalError("Failed to create reply", { created: false });
		}
	};

	getReplies = async (req: AuthenticatedRequest) => {
		const id = req.params.id!;
		const account = req.account;

		try {
			logger.debug("Retrieving post replies");
			const post = await getPostById(id);

			if (!post) {
				logger.warn("Post not found when retrieving replies");
				throw new NotFoundError("Post not found", { retrieved: false });
			}

			if (post.private) {
				if (account && post.accountId === account.id) {
				} else if (
					account &&
					(await isFollowing(account.id, post.accountId)) &&
					(await isFollowing(post.accountId, account.id))
				) {
				} else {
					logger.warn("Unauthorized access to replies of private post");
					throw new UnauthorizedError(
						"You are not authorized to view replies for this post",
						{ retrieved: false },
					);
				}
			}

			const replies = await getRepliesForPost(id);
			const mappedReplies = await Promise.all(
				replies.map(async (reply) => {
					const likeCount = await getPostLikesCount(reply.replyPostId);
					const replyCount = await getPostRepliesCount(reply.replyPostId);
					return {
						...reply.replyPost,
						likesCount: likeCount,
						repliesCount: replyCount,
					};
				}),
			);

			logger.info(
				`Post replies retrieved successfully ${mappedReplies.length}`,
			);

			return {
				retrieved: mappedReplies.length > 0,
				replies: mappedReplies,
			};
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			logger.error("Error retrieving post replies");
			throw new InternalError("Failed to retrieve replies", {
				retrieved: false,
			});
		}
	};

	getFeed = async (req: AuthenticatedRequest) => {
		const account = req.account;

		try {
			logger.debug("Retrieving feed");
			const posts = await getFeedPosts(account?.id);
			const mappedPosts = await Promise.all(
				posts.map(async (post) => {
					return {
						...post,
						likesCount: await getPostLikesCount(post.id),
						repliesCount: await getPostRepliesCount(post.id),
					};
				}),
			);

			logger.info("Feed retrieved successfully");
			return { posts: mappedPosts, retrieved: posts.length > 0 };
		} catch (error) {
			logger.error("Error retrieving feed");
			throw new InternalError("Failed to retrieve feed", { retrieved: false });
		}
	};
}

export default PostController;
