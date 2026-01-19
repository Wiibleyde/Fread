import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { storage } from "@/lib/storage";
import { toast } from "react-toastify";

export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			content,
			isPrivate,
		}: {
			content: string;
			isPrivate?: boolean;
		}) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return postApi.createPost({ token, content, isPrivate });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Post created successfully");
		},
		onError: () => {
			toast.error("Failed to create post");
		},
	});
};

export const useEditPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			postId,
			content,
		}: {
			postId: string;
			content: string;
		}) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return postApi.editPost(postId, { token, content });
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.posts.detail(variables.postId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
			toast.success("Post updated successfully");
		},
		onError: () => {
			toast.error("Failed to update post");
		},
	});
};

export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (postId: string) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return postApi.deletePost(postId, { token });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
			toast.success("Post deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete post");
		},
	});
};

export const useCreateReply = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			postId,
			content,
		}: {
			postId: string;
			content: string;
		}) => {
			const token = storage.getToken();
			if (!token) throw new Error("Not authenticated");
			return postApi.createReply(postId, { token, content });
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.posts.replies(variables.postId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.posts.detail(variables.postId),
			});
			toast.success("Reply posted successfully");
		},
		onError: () => {
			toast.error("Failed to post reply");
		},
	});
};
