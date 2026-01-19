export interface Account {
	id: string;
	username: string;
	displayName: string;
	description: string;
	private: boolean;
	profilePictureId: string | null;
	postsCount?: number;
	followingCount?: number;
	followersCount?: number;
	createdAt: string;
	updatedAt: string | null;
}

export interface Post {
	id: string;
	accountId: string;
	content: string;
	private: boolean;
	creationDate: string;
	likesCount: number;
	repliesCount: number;
}

export interface File {
	id: string;
	accountId: string;
	filename: string;
	path: string;
}

export interface ApiError {
	error: string;
	message: string;
	data?: object;
}

export interface OAuthRedirectResponse {
	url: string;
}

export interface LoginResponse {
	token: string;
}

export interface AccountResponse {
	retrieved: boolean;
	account: Account | null;
}

export interface PostsResponse {
	retrieved: boolean;
	posts: Post[];
}

export interface PostResponse {
	retrieved: boolean;
	post: Post;
}

export interface RepliesResponse {
	retrieved: boolean;
	replies: Post[];
}

export interface CreatePostRequest {
	token: string;
	content: string;
	isPrivate?: boolean;
}

export interface CreatePostResponse {
	created: boolean;
	message: string;
}

export interface EditPostRequest {
	token: string;
	content?: string;
}

export interface EditPostResponse {
	edited: boolean;
	post: Post;
}

export interface DeletePostRequest {
	token: string;
}

export interface DeletePostResponse {
	deleted: boolean;
	message: string;
}

export interface CreateReplyRequest {
	token: string;
	content: string;
}

export interface CreateReplyResponse {
	created: boolean;
	message: string;
}

export interface EditAccountRequest {
	token: string;
	displayName?: string;
	description?: string | null;
	isPrivate?: boolean;
}

export interface EditAccountResponse {
	edited: boolean;
	message: string;
}

export interface DeleteAccountRequest {
	token: string;
}

export interface DeleteAccountResponse {
	deleted: boolean;
	message: string;
}

export interface FollowRequest {
	token: string;
}

export interface FollowResponse {
	followed: boolean;
	message: string;
}

export interface UnfollowRequest {
	token: string;
}

export interface UnfollowResponse {
	unfollowed: boolean;
	message: string;
}

export interface LikeRequest {
	token: string;
}

export interface LikeResponse {
	liked: boolean;
	message: string;
}

export interface UnlikeRequest {
	token: string;
}

export interface UnlikeResponse {
	unliked: boolean;
	message: string;
}

export interface OptionalAuthRequest {
	token?: string;
}
