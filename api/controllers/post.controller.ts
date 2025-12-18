import type { Request } from "express";
import BadRequestError from "../errors/badrequest.error";
import InternalError from "../errors/internal.error";
import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";
import { createPostDB, getPostById } from "../services/post.service";

class PostController {
    createPost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        const { content, isPrivate } = req.body;

        if (!account) {
            throw new UnauthorizedError();
        }

        if (!content || typeof content !== "string") {
            throw new BadRequestError("Content is required and must be a string");
        }

        try {
            await createPostDB(content, account.id, Boolean(isPrivate));
        } catch (error) {
            console.error("Error creating post:", error);
            throw new InternalError("Failed to create post");
        }

        return { created: true, message: "Post created" };
    }

    getPost = async (req: Request) => {
        const id = req.params.id;

        if (!id) {
            throw new BadRequestError("ID parameter is required");
        }

        try {
            const post = await getPostById(id);
            return post;
        } catch (error) {
            console.error("Error retrieving post:", error);
            throw new InternalError("Failed to retrieve post");
        }
    }
}

export default PostController;