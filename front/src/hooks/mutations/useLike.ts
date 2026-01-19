import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { likeApi } from "@/lib/api-client";
import type { Post } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export const useLike = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (postId: string) => {
			return likeApi.like(postId, {});
		},
		onMutate: async (postId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.posts.detail(postId),
			});

			const previousPost = queryClient.getQueryData<Post>(
				queryKeys.posts.detail(postId),
			);

			if (previousPost) {
				queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
					...previousPost,
					likesCount: previousPost.likesCount + 1,
				});
			}

			return { previousPost };
		},
		onError: (error, postId, context) => {
			if (context?.previousPost) {
				queryClient.setQueryData(
					queryKeys.posts.detail(postId),
					context.previousPost,
				);
			}
			toast.error("Failed to like post");
		},
		onSettled: (data, error, postId) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.posts.detail(postId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
		},
	});
};

export const useUnlike = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (postId: string) => {
			return likeApi.unlike(postId, {});
		},
		onMutate: async (postId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.posts.detail(postId),
			});

			const previousPost = queryClient.getQueryData<Post>(
				queryKeys.posts.detail(postId),
			);

			if (previousPost) {
				queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
					...previousPost,
					likesCount: Math.max(0, previousPost.likesCount - 1),
				});
			}

			return { previousPost };
		},
		onError: (error, postId, context) => {
			if (context?.previousPost) {
				queryClient.setQueryData(
					queryKeys.posts.detail(postId),
					context.previousPost,
				);
			}
			toast.error("Failed to unlike post");
		},
		onSettled: (data, error, postId) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.posts.detail(postId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
		},
	});
};
