import { useQuery } from "@tanstack/react-query";
import { accountApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export const useAccount = (accountId: string) => {
	return useQuery({
		queryKey: queryKeys.account.profile(accountId),
		queryFn: async () => {
			const response = await accountApi.getAccount(accountId);
			return response.account;
		},
		enabled: !!accountId,
	});
};

export const useAccountPosts = (accountId: string) => {
	return useQuery({
		queryKey: queryKeys.posts.list(accountId),
		queryFn: async () => {
			const response = await accountApi.getAccountPosts(accountId);
			return response.posts;
		},
		enabled: !!accountId,
	});
};
