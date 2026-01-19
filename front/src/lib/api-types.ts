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
	isFollowing?: boolean;
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
	isLiked?: boolean;
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
	content: string;
	isPrivate?: boolean;
}

export interface CreatePostResponse {
	created: boolean;
	message: string;
}

export interface EditPostRequest {
	content?: string;
}

export interface EditPostResponse {
	edited: boolean;
	post: Post;
}

export type DeletePostRequest = Record<string, never>;

export interface DeletePostResponse {
	deleted: boolean;
	message: string;
}

export interface CreateReplyRequest {
	content: string;
}

export interface CreateReplyResponse {
	created: boolean;
	message: string;
}

export interface EditAccountRequest {
	displayName?: string;
	description?: string | null;
	isPrivate?: boolean;
}

export interface EditAccountResponse {
	edited: boolean;
	message: string;
}

export type DeleteAccountRequest = Record<string, never>;

export interface DeleteAccountResponse {
	deleted: boolean;
	message: string;
}

export type FollowRequest = Record<string, never>;

export interface FollowResponse {
	followed: boolean;
	message: string;
}

export type UnfollowRequest = Record<string, never>;

export interface UnfollowResponse {
	unfollowed: boolean;
	message: string;
}

export type LikeRequest = Record<string, never>;

export interface LikeResponse {
	liked: boolean;
	message: string;
}

export type UnlikeRequest = Record<string, never>;

export interface UnlikeResponse {
	unliked: boolean;
	message: string;
}

export interface OptionalAuthRequest {
	token?: string;
}
