import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { followApi } from "@/lib/api-client";
import type { Account } from "@/lib/api-types";
import { queryKeys } from "@/lib/query-keys";

export const useFollow = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (accountId: string) => {
			return followApi.follow(accountId, {});
		},
		onMutate: async (accountId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.account.profile(accountId),
			});

			const previousAccount = queryClient.getQueryData<Account>(
				queryKeys.account.profile(accountId),
			);

			if (previousAccount) {
				queryClient.setQueryData<Account>(
					queryKeys.account.profile(accountId),
					{
						...previousAccount,
						followersCount: (previousAccount.followersCount || 0) + 1,
					},
				);
			}

			return { previousAccount };
		},
		onError: (error, accountId, context) => {
			if (context?.previousAccount) {
				queryClient.setQueryData(
					queryKeys.account.profile(accountId),
					context.previousAccount,
				);
			}
			toast.error("Failed to follow user");
		},
		onSuccess: () => {
			toast.success("Successfully followed user");
		},
		onSettled: (data, error, accountId) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.account.profile(accountId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.follows.all });
		},
	});
};

export const useUnfollow = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (accountId: string) => {
			return followApi.unfollow(accountId, {});
		},
		onMutate: async (accountId) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.account.profile(accountId),
			});

			const previousAccount = queryClient.getQueryData<Account>(
				queryKeys.account.profile(accountId),
			);

			if (previousAccount) {
				queryClient.setQueryData<Account>(
					queryKeys.account.profile(accountId),
					{
						...previousAccount,
						followersCount: Math.max(
							0,
							(previousAccount.followersCount || 0) - 1,
						),
					},
				);
			}

			return { previousAccount };
		},
		onError: (error, accountId, context) => {
			if (context?.previousAccount) {
				queryClient.setQueryData(
					queryKeys.account.profile(accountId),
					context.previousAccount,
				);
			}
			toast.error("Failed to unfollow user");
		},
		onSuccess: () => {
			toast.success("Successfully unfollowed user");
		},
		onSettled: (data, error, accountId) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.account.profile(accountId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.follows.all });
		},
	});
};
