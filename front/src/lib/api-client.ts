import axios, { type AxiosError, type AxiosInstance } from "axios";
import type {
	AccountResponse,
	CreatePostRequest,
	CreatePostResponse,
	CreateReplyRequest,
	CreateReplyResponse,
	DeleteAccountRequest,
	DeleteAccountResponse,
	DeletePostRequest,
	DeletePostResponse,
	EditAccountRequest,
	EditAccountResponse,
	EditPostRequest,
	EditPostResponse,
	FollowRequest,
	FollowResponse,
	LikeRequest,
	LikeResponse,
	LoginResponse,
	OAuthRedirectResponse,
	OptionalAuthRequest,
	PostResponse,
	PostsResponse,
	RepliesResponse,
	UnfollowRequest,
	UnfollowResponse,
	UnlikeRequest,
	UnlikeResponse,
} from "./api-types";
import { storage } from "./storage";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const createApiClient = (): AxiosInstance => {
	const client = axios.create({
		baseURL: API_BASE_URL,
		headers: {
			"Content-Type": "application/json",
		},
	});

	client.interceptors.request.use(
		(config) => {
			const token = storage.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error) => Promise.reject(error),
	);

	client.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			if (error.response?.status === 401) {
				storage.clear();
				if (
					typeof window !== "undefined" &&
					!window.location.pathname.startsWith("/login")
				) {
					window.location.href = "/login";
				}
			}
			return Promise.reject(error);
		},
	);

	return client;
};

export const apiClient = createApiClient();

export const authApi = {
	getDiscordRedirect: async (): Promise<OAuthRedirectResponse> => {
		const { data } =
			await apiClient.get<OAuthRedirectResponse>("/auth/discord");
		return data;
	},

	handleDiscordCallback: async (code: string): Promise<LoginResponse> => {
		const { data } = await apiClient.get<LoginResponse>(
			`/auth/discord/callback?code=${code}`,
		);
		return data;
	},

	getGoogleRedirect: async (): Promise<OAuthRedirectResponse> => {
		const { data } = await apiClient.get<OAuthRedirectResponse>("/auth/google");
		return data;
	},

	handleGoogleCallback: async (code: string): Promise<LoginResponse> => {
		const { data } = await apiClient.get<LoginResponse>(
			`/auth/google/callback?code=${code}`,
		);
		return data;
	},
};

export const accountApi = {
	getAccount: async (id: string): Promise<AccountResponse> => {
		const { data } = await apiClient.get<AccountResponse>(`/account/${id}`);
		return data;
	},

	editAccount: async (
		request: EditAccountRequest,
	): Promise<EditAccountResponse> => {
		const { data } = await apiClient.patch<EditAccountResponse>(
			"/account",
			request,
		);
		return data;
	},

	deleteAccount: async (
		id: string,
		request: DeleteAccountRequest,
	): Promise<DeleteAccountResponse> => {
		const { data } = await apiClient.delete<DeleteAccountResponse>(
			`/account/${id}`,
			{ data: request },
		);
		return data;
	},

	getAccountPosts: async (id: string): Promise<PostsResponse> => {
		const { data } = await apiClient.get<PostsResponse>(`/account/${id}/posts`);
		return data;
	},
};

export const postApi = {
	createPost: async (
		request: CreatePostRequest,
	): Promise<CreatePostResponse> => {
		const { data } = await apiClient.post<CreatePostResponse>("/post", request);
		return data;
	},

	getPost: async (
		id: string,
		request?: OptionalAuthRequest,
	): Promise<PostResponse> => {
		const { data } = await apiClient.get<PostResponse>(`/post/${id}`, {
			data: request,
		});
		return data;
	},

	editPost: async (
		id: string,
		request: EditPostRequest,
	): Promise<EditPostResponse> => {
		const { data } = await apiClient.patch<EditPostResponse>(
			`/post/${id}`,
			request,
		);
		return data;
	},

	deletePost: async (
		id: string,
		request: DeletePostRequest,
	): Promise<DeletePostResponse> => {
		const { data } = await apiClient.delete<DeletePostResponse>(`/post/${id}`, {
			data: request,
		});
		return data;
	},

	createReply: async (
		postId: string,
		request: CreateReplyRequest,
	): Promise<CreateReplyResponse> => {
		const { data } = await apiClient.post<CreateReplyResponse>(
			`/post/${postId}/reply`,
			request,
		);
		return data;
	},

	getReplies: async (
		postId: string,
		request?: OptionalAuthRequest,
	): Promise<RepliesResponse> => {
		const { data } = await apiClient.get<RepliesResponse>(
			`/post/${postId}/replies`,
			{ data: request },
		);
		return data;
	},
};

export const followApi = {
	follow: async (
		accountId: string,
		request: FollowRequest,
	): Promise<FollowResponse> => {
		const { data } = await apiClient.post<FollowResponse>(
			`/follow/${accountId}`,
			request,
		);
		return data;
	},

	unfollow: async (
		accountId: string,
		request: UnfollowRequest,
	): Promise<UnfollowResponse> => {
		const { data } = await apiClient.delete<UnfollowResponse>(
			`/follow/${accountId}`,
			{ data: request },
		);
		return data;
	},
};

export const likeApi = {
	like: async (postId: string, request: LikeRequest): Promise<LikeResponse> => {
		const { data } = await apiClient.post<LikeResponse>(
			`/like/${postId}`,
			request,
		);
		return data;
	},

	unlike: async (
		postId: string,
		request: UnlikeRequest,
	): Promise<UnlikeResponse> => {
		const { data } = await apiClient.delete<UnlikeResponse>(`/like/${postId}`, {
			data: request,
		});
		return data;
	},
};
