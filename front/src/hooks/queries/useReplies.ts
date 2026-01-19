import { useQuery } from "@tanstack/react-query";
import { postApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export const useReplies = (postId: string) => {
	return useQuery({
		queryKey: queryKeys.posts.replies(postId),
		queryFn: async () => {
			const response = await postApi.getReplies(postId);
			return response.replies;
		},
		enabled: !!postId,
	});
};
