import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import AppError from "../errors/AppError";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { createPostDB, deletePostByIdDb, getPostById } from "../services/post.service";
import { isFollowing } from "../services/follow.service";
import NotFoundError from "../errors/notfound.error";
import { Logger } from "../utils/logger";

const logger = Logger.for(import.meta.url);

class PostController {

    createPost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const { content, isPrivate } = req.body;

        if (!content || typeof content !== "string") {
            logger.warn("Create post with invalid content");
            throw new BadRequestError("Content is required and must be a string", { created: false });
        }

        try {
            logger.info("Creating post");
            await createPostDB(content, account.id, Boolean(isPrivate));
        } catch (error) {
            logger.error("Error creating post");
            throw new InternalError("Failed to create post", { created: false });
        }

        return { created: true, message: "Post created" };
    }

    getPost = async (req: AuthenticatedRequest) => {
        const id = req.params.id;
        const account = req.account;

        if (!id) {
            logger.warn("Get post called without ID");
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        try {
            logger.debug("Retrieving post");
            const post = await getPostById(id);

            if (!post) {
                logger.warn("Post not found");
                throw new NotFoundError("Post not found", { retrieved: false });
            }

            if (post.private) {

                if (account && await isFollowing(account.id, post.accountId) && await isFollowing(post.accountId, account.id)) {
                    logger.debug("Post retrieved");
                    return { retrieved: !!post, post };
                }
                // connecté mais pas de follow -> error
                if (account && (!await isFollowing(account.id, post.accountId) || !await isFollowing(post.accountId, account.id))) {
                    logger.warn("Not mutually following for private post");
                    throw new UnauthorizedError("You are not authorized to view this post", { retrieved: false });
                }

                // pas connecté -> error
                if (!account || (post.accountId !== account.id)) {
                    logger.warn("Unauthenticated access to private post");
                    throw new UnauthorizedError("You are not authorized to view this post", { retrieved: false });
                }
            }

            return { retrieved: !!post, post };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error("Error retrieving post");
            throw new InternalError("Failed to retrieve post", { retrieved: false });
        }
    }

    deletePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            logger.warn("Delete post called without ID");
            throw new BadRequestError("ID parameter is required", { deleted: false });
        }

        const post = await getPostById(id);

        if (!post) {
            logger.warn("Post not found for deletion");
            throw new BadRequestError("Post not found", { deleted: false });
        }

        if (post.accountId !== account.id) {
            logger.warn("Unauthorized delete attempt for post");
            throw new UnauthorizedError("You are not authorized to delete this post", { deleted: false });
        }

        try {
            logger.info("Deleting post");
            await deletePostByIdDb(id);
            return { deleted: true, message: "Post deleted" };
        } catch (error) {
            logger.error("Error deleting post");
            throw new InternalError("Failed to delete post", { deleted: false });
        }
    }
}

export default PostController;