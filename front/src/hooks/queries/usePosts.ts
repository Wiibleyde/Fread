import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export const usePosts = (accountId?: string) => {
	return useQuery({
		queryKey: queryKeys.posts.list(accountId),
		queryFn: async () => {
			if (accountId) {
				const response = await accountApi.getAccountPosts(accountId);
				return response.posts;
			}
			return [];
		},
		refetchInterval: 15000,
	});
};
