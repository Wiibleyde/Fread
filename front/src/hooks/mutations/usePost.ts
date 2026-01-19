import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { postApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

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
			return postApi.createPost({ content, isPrivate });
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
			return postApi.editPost(postId, { content });
		},
		onSuccess: (_data, variables) => {
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
			return postApi.deletePost(postId, {});
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
			return postApi.createReply(postId, { content });
		},
		onSuccess: (_data, variables) => {
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
