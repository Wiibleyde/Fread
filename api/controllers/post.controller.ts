import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import AppError from "../errors/AppError";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import type { PostCreateBody, PostEditBody } from "../schemas/posts";
import { createPostDB, deletePostByIdDb, editPostById, getPostById } from "../services/post.service";
import { isFollowing } from "../services/follow.service";
import NotFoundError from "../errors/notfound.error";
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
    }

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
                    return { retrieved: !!post, post };
                }

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
        const id = req.params.id!;

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

    editPost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id!;
        const { content, isPrivate } = req.body as PostEditBody;

        const post = await getPostById(id);

        if (!post) {
            logger.warn("Post not found for editing");
            throw new BadRequestError("Post not found", { edited: false });
        }

        if (post.accountId !== account.id) {
            logger.warn("Unauthorized edit attempt for post");
            throw new UnauthorizedError("You are not authorized to edit this post", { edited: false });
        }

        try {
            const updatedPost = await editPostById(id, content ?? post.content, isPrivate ?? post.private);
            logger.info("Post edited successfully");
            return { edited: true, post: updatedPost };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error("Error editing post");
            throw new InternalError("Failed to edit post", { edited: false });
        }
    }
}

export default PostController;