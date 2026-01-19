import { useQuery } from "@tanstack/react-query";
import { followApi } from "@/lib/api-client";
import type { FollowedResponse, FollowersResponse } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export const useFollowers = (accountId: string) => {
	return useQuery<FollowersResponse>({
		queryKey: queryKeys.follows.followers(accountId),
		queryFn: async () => {
			return await followApi.getFollowers(accountId);
		},
		enabled: !!accountId,
	});
};

export const useFollowed = (accountId: string) => {
	return useQuery<FollowedResponse>({
		queryKey: queryKeys.follows.following(accountId),
		queryFn: async () => {
			return await followApi.getFollowed(accountId);
		},
		enabled: !!accountId,
	});
};
