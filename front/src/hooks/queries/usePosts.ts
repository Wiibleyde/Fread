import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export const usePosts = () => {
	return useQuery({
		queryKey: queryKeys.posts.lists(),
		queryFn: async () => {
			const response = await accountApi.getFeed();
			return response.posts;
		},
		refetchInterval: 15000,
	});
};
