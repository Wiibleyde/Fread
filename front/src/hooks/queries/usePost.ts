import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export const usePost = (postId: string) => {
	return useQuery({
		queryKey: queryKeys.posts.detail(postId),
		queryFn: async () => {
			const response = await postApi.getPost(postId);
			return response.post;
		},
		enabled: !!postId,
	});
};
