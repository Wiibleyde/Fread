import type { Request } from "express";
import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { createPostDB, deletePostByIdDb, getPostById } from "../services/post.service";

class PostController {
    createPost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const { content, isPrivate } = req.body;

        if (!account) {
            throw new UnauthorizedError("Unauthorized", { created: false });
        }

        if (!content || typeof content !== "string") {
            throw new BadRequestError("Content is required and must be a string", { created: false });
        }

        try {
            await createPostDB(content, account.id, Boolean(isPrivate));
        } catch (error) {
            console.error("Error creating post:", error);
            throw new InternalError("Failed to create post", { created: false });
        }

        return { created: true, message: "Post created" };
    }

    getPost = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required", { retrieved: false });
        }

        try {
            const post = await getPostById(id);
            return { retrieved: true, post };
        } catch (error) {
            console.error("Error retrieving post:", error);
            throw new InternalError("Failed to retrieve post", { retrieved: false });
        }
    }

    deletePost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required", { deleted: false });
        }

        if (!account) {
            throw new UnauthorizedError("Unauthorized", { deleted: false });
        }

        const post = await getPostById(id);

        if (!post) {
            throw new BadRequestError("Post not found", { deleted: false });
        }

        if (post.accountId !== account.id) {
            throw new UnauthorizedError("You are not authorized to delete this post", { deleted: false });
        }

        try {
            await deletePostByIdDb(id);
            return { deleted: true, message: "Post deleted" };
        } catch (error) {
            console.error("Error deleting post:", error);
            throw new InternalError("Failed to delete post", { deleted: false });
        }
    }
}

export default PostController;