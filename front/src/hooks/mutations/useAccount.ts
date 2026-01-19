import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { accountApi } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { storage } from "@/lib/storage";

export const useEditAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			displayName,
			description,
			isPrivate,
		}: {
			displayName?: string;
			description?: string | null;
			isPrivate?: boolean;
		}) => {
			return accountApi.editAccount({
				displayName,
				description,
				isPrivate,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
			toast.success("Profile updated successfully");
		},
		onError: () => {
			toast.error("Failed to update profile");
		},
	});
};

export const useDeleteAccount = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (accountId: string) => {
			return accountApi.deleteAccount(accountId, {});
		},
		onSuccess: () => {
			storage.clear();
			queryClient.clear();
			toast.success("Account deleted successfully");
			window.location.href = "/login";
		},
		onError: () => {
			toast.error("Failed to delete account");
		},
	});
};
