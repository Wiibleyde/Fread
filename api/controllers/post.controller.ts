import UnauthorizedError from "../errors/unauthorized.error";
import type { AuthenticatedRequest } from "../models/auth.model";

class PostController {
    createPost = async (req: AuthenticatedRequest) => {
        const account = req.account;
        if (!account) {
            throw new UnauthorizedError();
        }
        // Logic to create a post
        return { created: true, message: "Post created" };
    }

}

export default PostController;